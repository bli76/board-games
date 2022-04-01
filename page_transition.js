window.gotoPage = function (button, href) 
{
    button.onclick = null;
    document.querySelector("body").classList.toggle("fadeout");
    setTimeout(() => 
    {
        window.location.href = href
    }, 700);
}