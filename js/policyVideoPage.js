jQuery(document).ready(function () {
    
    // If his state is not equal to 1 , send him back to splash page.
    $.ajax({
        async: false,
        type: 'GET',
        url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
        success: function (data) {

            console.log("Policy Test ");
            console.log(data);

            //Redirect to main page because the user state is not 1.
            if (data.state != 2) {
                window.location.href = "../index.html";
            }
        }
    });

    $(function () {
        $('.pop-up').hide();
        $('.pop-up').fadeIn(200);
        $('#continue').click(function (e) {
            $('.pop-up').fadeOut(300);
            $('#overlay').removeClass('blur-in');
            $('#overlay').addClass('blur-out');
            e.stopPropagation();
        });
    });

});