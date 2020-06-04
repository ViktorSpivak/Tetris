export default ({ timeOfGame, score, results }) => {
  const timeForShow = Object.values(timeOfGame).join(":");
  document.querySelector(".results").classList.add("showResults");
  const resultsList = document.querySelector(".results-list");
  results.push(score);
  document
    .querySelector(".results-list")
    .insertAdjacentHTML(
      "beforeend",
      `<li><span>${timeForShow}</span><span>   / ${score}</span>  </li>`
    );
  resultsList.scrollTo({
    top: resultsList.scrollHeight,
    behavior: "smooth",
  });
  return results;
};
