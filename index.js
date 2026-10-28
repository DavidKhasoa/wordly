const wordsApi = "https://api.dictionaryapi.dev/api/v2/entries/en";

const input = document.getElementById("input-display")
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
  const allPhonetics = data.flatMap((e) => e.phonetics);
  const phonetics =
    entry.phonetics.find((p) => p.audio) || allPhonetics[0] || {};

  const audio = phonetics.audio?.startsWith("//")
    ? `https:${phonetics.audio}`
    : phonetics.audio || "";

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
    word: entry.word,
    phonetic: entry.phonetic || phonetics.text || allPhonetics.find((p) => p.text)?.text || "",
    audio,
    meanings: entry.meanings,
  };
}

function displayWords(data) {
  display.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = data.word;

  const phonetic = document.createElement("p");
  phonetic.textContent = data.phonetic || "";

  display.append(title, phonetic)

  if (data.audio) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Audio";
    button.addEventListener("click", () => {
      new Audio(data.audio).play().catch((err) => {
        console.error(err);
        showError("Couldn't play the audio for this word.");
      });
    })

    display.append(button);
  };

  data.meanings.forEach((meaning) => {
  const heading = document.createElement("h3");
  heading.textContent = meaning.partOfSpeech;

  const list = document.createElement("ol");
  meaning.definitions.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = d.definition;   
    list.append(li);
  });

  const synonyms = document.createElement("p");
  synonyms.textContent = meaning.synonyms.length
    ? `Synonyms: ${meaning.synonyms.join(", ")}`
    : "";

    display.append(heading, list, synonyms);
  });

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
        if(!response.ok) {
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
        clearDisplayWords()
        showError(message);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault()
    fetchWords(input.value)
})


