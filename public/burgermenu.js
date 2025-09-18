let iconMenu = document.querySelector('.burgermenu');

    let animationMenu = bodymovin.loadAnimation({
            container: iconMenu,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: "./animations/menu.json"
    });

    var directionMenu = 1;
      iconMenu.addEventListener('click', (e) => {
      animationMenu.setDirection(directionMenu);
      animationMenu.play();
      directionMenu = -directionMenu;
    });