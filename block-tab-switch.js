// Ловит сворачивание окна/смену вкладки
document.addEventListener("visibilitychange", () => {
  if (document.hidden) alert("Вернитесь на тест!");
});