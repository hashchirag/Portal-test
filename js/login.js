function InitiateloginNetworkCall(provider, unique_identifier, name, fb_access_token) {

    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        sweetAlert("", 'Giving up :( Cannot create an XMLHTTP instance', "error");
        return false;
    }

    httpRequest.onreadystatechange = login;
    httpRequest.open('POST', BASE_URL + "v2/api/tutor_corner/login/");
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    var params;

    if (provider == "google") {

        params = "provider=" + provider + "&email=" + unique_identifier + "&name=" + name;
        sessionStorage.setItem("provider_parameter", "email");
    }
    else if (provider == "facebook") {
        params = "provider=" + provider + "&uid=" + unique_identifier + "&name=" + name + "&access_token=" + fb_access_token;
        sessionStorage.setItem("provider_parameter", "uid");
    }

    //Save the unique_idenitfier
    sessionStorage.setItem("unique_identifier", unique_identifier);


    httpRequest.send(params);

}

function login() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            var jsonResponse = jQuery.parseJSON(httpRequest.response);

            sessionStorage.setItem("HL_NOW_LOGGED_IN", true);
            // console.log(" Login API Response " + httpRequest.response);


            if (jsonResponse.status == "error") {
                sweetAlert("", jsonResponse.message, "error");
            }
            else if (jsonResponse.status == "success") {

                //Check state and redirect

                switch (jsonResponse.state) {

                    //This is the state which corresponds to User Created. Redirect to details page.
                    case 1:
                        // window.location.href = "views/detailsPage.html";
                        $('#sign_in_or_sign_up_section').hide();
                        $('#registration_form').show();
                        break;

                    //This is the state which corresponds to Details Filled. Redirect to policy video page.
                    case 2:
                        window.location.href = "views/policyVideoPage.html";
                        break;

                    //This is the state which corresponds to Personality Test Passed. Redirect to dashboard Page.
                    case 3:
                        window.location.href = "views/dashboard.html";
                        break;

                    //This is the state which corresponds to Personality Test Failed. Redirect to Dashboard Page.
                    case 4:
                        window.location.href = "views/sorry.html";
                        break;

                    //This is the state which corresponds to Academic Test Passed. Redirect to Dashboard Page.
                    case 5:
                        window.location.href = "views/dashboard.html";
                        break;

                    //This is the state which corresponds to Plan category Assigned. Redirect to Dashboard Page.
                    case 6:
                        window.location.href = "views/dashboard.html";
                        break;

                    default :
                        window.location.href = "index.html";
                        break;

                }
            }

        } else {
            sweetAlert("", 'There was a problem with the request.', "error");
        }
    }

}