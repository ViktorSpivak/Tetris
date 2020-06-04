export default ({ score }) => {
  const finScore = document.querySelector(".finScore");
  finScore.textContent = `Final score : ${score}`;
  document.querySelector(".lastMassage").classList.add("showLastMassage");
  return true;
};
