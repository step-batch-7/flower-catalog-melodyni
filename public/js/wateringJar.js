const hideJar = function () {
  const jar = document.querySelector('.jar');
  jar.style.display = 'none';
  setTimeout(() => {
    jar.style.display = 'block';
  }, 1000);
};
