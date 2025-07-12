// Блокирует копирование + правую кнопку + DevTools
document.addEventListener("copy", (e) => e.preventDefault());
document.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("resize", () => {
  if (window.outerWidth - window.innerWidth > 100) {
    document.body.innerHTML = '<h1 style="color:red">Включены DevTools! Тест заблокирован.</h1>';
  }
});