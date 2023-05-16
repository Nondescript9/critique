// NAVBAR SCROLL ANIMATION
$(window).scroll(() => {
  if ($(document).scrollTop() > 50) {
    $('.navbar').addClass('navbar-bg-light');
  } else {
    $('.navbar').removeClass('navbar-bg-light');
  }
});

// ALERT FADEOUT
$('.alert-dismissible').on(
  'load',
  setTimeout(() => {
    $('.alert-dismissible').fadeOut(500);
  }, 3000)
);

// FORM VALIDATION
(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      },
      false
    );
  });
})();
