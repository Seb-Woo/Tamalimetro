document.addEventListener("DOMContentLoaded", function () {
  // Espera a que jQuery esté cargado
  const checkJQuery = setInterval(function () {
    if (typeof jQuery !== "undefined") {
      clearInterval(checkJQuery);
      initializeScrollSystem();
    }
  }, 100);

  function initializeScrollSystem() {
    $(function () {
      // Configuración
      const sectionArray = [1, 2, 3, 4]; // IDs de tus secciones (section_1, section_2, etc.)
      const navHeight = 154; // Altura de tu navbar (ajusta según necesites)

      // 1. Sistema de scroll suave para enlaces
      $(".click-scroll").on("click", function (e) {
        e.preventDefault();
        const target = $(this).attr("href");

        if (target) {
          const $target = $(target);
          if ($target.length) {
            $("html, body")
              .stop()
              .animate(
                {
                  scrollTop: $target.offset().top - navHeight,
                },
                800,
                "swing"
              );
          }
        }
      });

      // 2. Detección de sección activa al hacer scroll
      $(window).scroll(function () {
        const docScroll = $(this).scrollTop();

        $.each(sectionArray, function (index, value) {
          const section = $("#section_" + value);
          if (section.length) {
            const offsetSection = section.offset().top - navHeight;

            if (docScroll >= offsetSection - 10) {
              // -10 para un margen
              $(".navbar-nav .nav-link")
                .removeClass("active")
                .addClass("inactive");

              $(".navbar-nav .nav-item .nav-link")
                .eq(index)
                .addClass("active")
                .removeClass("inactive");
            }
          }
        });
      });

      // 3. Estado inicial
      $(".navbar-nav .nav-link").addClass("inactive");
      $(".navbar-nav .nav-item .nav-link")
        .first()
        .addClass("active")
        .removeClass("inactive");
    });
  }
});
