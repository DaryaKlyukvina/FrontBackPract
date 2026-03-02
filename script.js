const toggleTheme = () => {
  if (document.body.classList.contains('light')) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
}

// установим начальную темму
document.body.classList.add('dark');

document.getElementById('theme-switch').addEventListener('click', toggleTheme);

// API
fetch('/products')
  .then(r => r.json())
  .then(data => console.log(data));