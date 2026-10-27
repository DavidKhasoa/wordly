const wordsApi = "https://api.dictionaryapi.dev/api/v2/entries/en";

const input = document.getElementById("input-display")
const wordSearch = document.getElementById("submit-button")
const errorMessage = document.getElementById("error-message")
const display = document.getElementById("word-display")
const form = document.getElementById("search-form")

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function closeError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

function flatten(data) {
  const [entry] = data;
  const phonetics =
    entry.phonetics.find((p) => p.audio) || entry.phonetics[0] || {};

  return {
    word: entry.word,
    definitions: entry.meanings.flatMap((m) =>
      m.definitions.map((d) => d.definition)
    ),
    synonyms: [
      ...new Set(
        entry.meanings.flatMap((m) => [
          ...m.synonyms,
          ...m.definitions.flatMap((d) => d.synonyms),
        ])
      ),
    ],
    phonetics,
  };
}

function displayWords(data) {
    display.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = data.word;

    const phonetic = document.createElement("p");
    phonetic.textContent = data.phonetics.text || "";

    const definition = document.createElement("p");
    definition.textContent = data.definitions;

    const synonyms = document.createElement("p");
    synonyms.textContent = data.synonyms.length
        ? `Synonyms: ${data.synonyms.join(", ")}`
        : "No synonyms found";

    display.append(title, phonetic, definition, synonyms)
}

function clearDisplayWords() {
  display.innerHTML = "";
}

async function fetchWords(word) {

    const query = word.trim();

    if(!query) {
        showError("Please input a valid word!")
        clearDisplayWords()
        return;
    };

    try{
        const response = await fetch(`${wordsApi}/${encodeURIComponent(query)}`);
        const data = await response.json()
        console.log(data)
        if(!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(data.message || data.title || "Word not found")
        }
        
        closeError()
        displayWords(flatten(data))

    }catch(error) {
      console.error(error)
        const message =
         error instanceof TypeError
            ? "Couldn't reach the dictionary service. Please try again in a moment."
            : error.message;
        showError(message);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault()
    fetchWords(input.value)
})


