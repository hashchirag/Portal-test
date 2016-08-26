jQuery(document).ready(function () {

    $('#registration_form').hide();
    
    // $('#gmailLogin').hide();
    // $('#gmailSignUp').hide();

    sweetAlert("", "Please ensure that you are using Google Chrome on your laptop/desktop before proceeding further.");


    tab = $('.tabs h3 a');

    tab.on('click', function (event) {
        event.preventDefault();
        tab.removeClass('active');
        $(this).addClass('active');

        tab_content = $(this).attr('href');
        $('div[id$="tab-content"]').removeClass('active');
        $(tab_content).addClass('active');
    });


    $('#signUpButtons').on('click', function (event) {
        if (!$('#terms_read').is(":checked"))
        // sweetAlert('It seems like you have not agreed to the HashLearn Now Terms of Service and Privacy Policy. Please tick the checkbox and try again.');
            sweetAlert("", "It seems like you have not agreed to the HashLearn Now Terms of Service and Privacy Policy. Please tick the checkbox and try again.", "error");
    })

    $('#terms_read').change(function () {

        //It is checked
        if ($(this).is(":checked")) {
            $('#fbSignUp').removeClass('inactive');
            $('#gmailSignUp').removeClass('inactive');
        } else {
            $('#fbSignUp').addClass('inactive');
            $('#gmailSignUp').addClass('inactive');
        }

    });


    var college_list_response = {};
    var degree_list_response = {};
    var language_list_response = {};
    var $fieldsOfFirstPageOfForm;
    var $fieldsOfSecondPageOfForm;
    var enableSubmitButton;


    var graduationYears = ["1950", "1951", "1952", "1953", "1954", "1955", "1956", "1957", "1958", "1959", "1960", "1961", "1962", "1963", "1964", "1965", "1966", "1967", "1968", "1969", "1970", "1971", "1971", "1972", "1973", "1974", "1975", "1976", "1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"];
    var sourcesOfMarketing = ["Referral", "email", "TV Ad", "Internet Ad", "Radio", "SMS", "Job/Internship Portals", "Other"];

    function addCheckbox(container, text, name) {
        var container = $(container);
        var inputs = container.find('input');
        var id = inputs.length + 1;

        $('<input />', {
            type: 'checkbox',
            id: 'cb' + id,
            value: text,
            name: name,
            class: 'checkbox_class'
        }).appendTo(container);
        $('<label />', {'for': 'cb' + id, text: text}).appendTo(container);
    }


    initViews();

    function initViews() {

        // Get all lists from the Backend and populate them

        getListOfCollege(BASE_URL + "v2/api/tutor_corner/get_college_list/");
        getListOfDegrees(BASE_URL + "v2/api/tutor_corner/get_degree_list/");
        getListOfLanguages(BASE_URL + "v2/api/tutor_corner/get_language_list/");
        populateGraduationYears();
        populateMarketingSources();
        addStudOrGradRadioButtonListener();

        // The default state of views.

        //Hide custom degree and custom college and custom source

        $('#custom_college').hide();
        $('#custom_degree').hide();
        $('#custom_source').hide();
        $('#referrer_name').hide();

        $('#next_button').removeClass('action-button_active').addClass('action-button_inactive');
        $('#next_button').prop('disabled', true);
        $('#submit').prop('disabled', true);

        refreshRequiredFieldsOfFirstPageOfForm();
        refreshRequiredFieldsOfSecondPageOfForm();

    }


    function validateFirstPageOfForm() {
        var $emptyFields = $fieldsOfFirstPageOfForm.filter(function () {

            // remove the $.trim if whitespace is counted as filled
            return $.trim(this.value) === "";
        });

        if (!$emptyFields.length && validateMobile($('#phone_number').val()) && validateEmail($('#email').val())) {
            $('#next_button').removeClass('action-button_inactive').addClass('action-button_active');
            $('#next_button').prop('disabled', false);

        } else {
            $('#next_button').removeClass('action-button_active').addClass('action-button_inactive');
        }
    }

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function validateMobile(number) {
        var re = /^\d{10}$/;
        return re.test(number);
    }

    function validateSecondPageOfForm() {


        //This validation is different from that of the the first page since it consists of checkboxes and radio buttons.

        enableSubmitButton = true;


        //Radio Buttons check
        if (!$('[name="stud_or_grad"]').is(':checked')) {
            enableSubmitButton = false;
        }

        //Checkbox checks
        if (!$("#msform input:checkbox:checked").length > 0) {
            enableSubmitButton = false;
        }

        // Source Check
        var $emptyFieldsOfSecondPageOfForm = $fieldsOfSecondPageOfForm.filter(function () {

            // remove the $.trim if whitespace is counted as filled
            return $.trim(this.value) === "";
        });

        if ($emptyFieldsOfSecondPageOfForm.length) {
            enableSubmitButton = false;
        }

        if (enableSubmitButton) {
            $('#submit').removeClass('action-button_inactive').addClass('action-button_active');
            $('#submit').prop('disabled', false);
        } else {
            $('#submit').removeClass('action-button_active').addClass('action-button_inactive');
            $('#submit').prop('disabled', true);

        }

    }


    //Get the new set of required fields and attach the KEY UP listener to it.
    function refreshRequiredFieldsOfFirstPageOfForm() {

        $fieldsOfFirstPageOfForm = $(".required");

        $fieldsOfFirstPageOfForm.keyup(function () {
            validateFirstPageOfForm();
        });
    }

    function refreshRequiredFieldsOfSecondPageOfForm() {

        $fieldsOfSecondPageOfForm = $(".required_second_page_of_form");

        $fieldsOfSecondPageOfForm.keyup(function () {
            validateSecondPageOfForm();
        });
    }

    //Generic function to add option to drop down
    function addOptionToDropDown(parent, text) {
        var x = document.getElementById(parent);
        var option = document.createElement("option");
        option.text = text;
        x.add(option);
    }


    function populateGraduationYears() {
        for (var i = graduationYears.length - 1; i > 1; i--) {
            addOptionToDropDown("year", (graduationYears[i]));
        }
    }

    function populateMarketingSources() {
        for (var i = 0; i < sourcesOfMarketing.length; i++) {
            addOptionToDropDown("source_list", (sourcesOfMarketing[i]));
        }
    }

    function getListOfLanguages(url) {
        httpRequestLanguages = new XMLHttpRequest();

        if (!httpRequestCollege) {
            sweetAlert("", 'Giving up :( Cannot create an XMLHTTP instance', "error");
            return false;
        }

        httpRequestLanguages.onreadystatechange = populateLanguageCheckboxes;
        httpRequestLanguages.open('GET', url);
        httpRequestLanguages.send();
    }


    function getListOfCollege(url) {
        httpRequestCollege = new XMLHttpRequest();

        if (!httpRequestCollege) {
            sweetAlert("", 'Giving up :( Cannot create an XMLHTTP instance', "error");
            return false;
        }

        httpRequestCollege.onreadystatechange = populateCollegeDropdown;
        httpRequestCollege.open('GET', url);
        httpRequestCollege.send();
    }

    function getListOfDegrees(url) {
        httpRequestDegree = new XMLHttpRequest();

        if (!httpRequestDegree) {
            sweetAlert("", 'Giving up :( Cannot create an XMLHTTP instance', "error");
            return false;
        }

        httpRequestDegree.onreadystatechange = populateDegreeDropdown;
        httpRequestDegree.open('GET', url);
        httpRequestDegree.send();
    }

    function populateLanguageCheckboxes() {
        if (httpRequestLanguages.readyState === XMLHttpRequest.DONE) {
            if (httpRequestLanguages.status === 200) {
                var jsonString = JSON.stringify(httpRequestLanguages.responseText);

                var obj = JSON.parse(jsonString);

                var jsonObj = $.parseJSON(obj);

                for (var i = 0; i < jsonObj.length; i++) {
                    language_list_response[jsonObj[i].name] = jsonObj[i].id;
                }

                //POPULATING COLLEGE DROP DOWN
                // addOptionToDropDown("college_list", "Other");

                for (var nameOfLanguage in language_list_response) {
                    addCheckbox('#languageListCheckboxes', nameOfLanguage, "language");
                }

                attachLanguageCheckboxListener();
            } else {
                sweetAlert("", 'There was a problem with the loading languages.', "error");
            }
        }
    }

    function populateCollegeDropdown() {
        if (httpRequestCollege.readyState === XMLHttpRequest.DONE) {
            if (httpRequestCollege.status === 200) {
                var jsonString = JSON.stringify(httpRequestCollege.responseText);

                var obj = JSON.parse(jsonString);

                var jsonObj = $.parseJSON(obj);

                for (var i = 0; i < jsonObj.length; i++) {
                    college_list_response[jsonObj[i].name] = jsonObj[i].id;
                }

                //POPULATING COLLEGE DROP DOWN
                addOptionToDropDown("college_list", "Other");

                for (var nameOfCollege in college_list_response) {
                    addOptionToDropDown("college_list", nameOfCollege);
                }

            } else {
                sweetAlert("", 'There was a problem with loading colleges.', "error");
            }
        }
    }

    function populateDegreeDropdown() {
        if (httpRequestDegree.readyState === XMLHttpRequest.DONE) {
            if (httpRequestDegree.status === 200) {
                var jsonString = JSON.stringify(httpRequestDegree.responseText);

                var obj = JSON.parse(jsonString);

                var jsonObj = $.parseJSON(obj);


                for (var i = 0; i < jsonObj.length; i++) {
                    degree_list_response[jsonObj[i].name] = jsonObj[i].id;
                }

                //POPULATING DEGREE DROP DOWN
                addOptionToDropDown("degree_list", "Other");

                for (var nameOfDegree in degree_list_response) {
                    addOptionToDropDown("degree_list", nameOfDegree);
                }

            } else {
                sweetAlert("", 'There was a problem with loading degrees.', "error");
            }
        }
    }


    //Listen and check for Custom college

    $("#college_list").change(function () {

        if (($(this).val() == 'Other')) {
            $('#custom_college').removeClass('dummy').addClass('required');
            $("#college_list").removeClass('required').addClass('dummy');
            $('#custom_college').show();
            refreshRequiredFieldsOfFirstPageOfForm();

        }
        else {
            $('#custom_college').hide();
            $('#custom_college').val('');
            $('#custom_college').removeClass('required').addClass('dummy');
            $("#college_list").removeClass('dummy').addClass('required');
            refreshRequiredFieldsOfFirstPageOfForm();
        }

        validateFirstPageOfForm();

    });

    //Listen and check for Custom Degree

    $("#degree_list").change(function () {

        if (($(this).val() == 'Other')) {
            $('#custom_degree').removeClass('dummy').addClass('required');
            $("#degree_list").removeClass('required').addClass('dummy');
            $('#custom_degree').show();
            $fieldsOfFirstPageOfForm = $(".required");
            refreshRequiredFieldsOfFirstPageOfForm();
        }
        else {
            $('#custom_degree').hide();
            $('#custom_degree').val('');
            $('#custom_degree').removeClass('required').addClass('dummy');
            $("#degree_list").removeClass('dummy').addClass('required');
            $fieldsOfFirstPageOfForm = $(".required");
            refreshRequiredFieldsOfFirstPageOfForm();
        }

        validateFirstPageOfForm();

    });

    $("#year").change(function () {
        validateFirstPageOfForm();
        $fieldsOfFirstPageOfForm = $(".required");
        refreshRequiredFieldsOfFirstPageOfForm();
    });


    //Functions Related to 2nd Page of the form.

    $("#source_list").change(function () {

        if (($(this).val() == 'Other')) {
            $('#custom_source').removeClass('dummy').addClass('required_second_page_of_form');
            $("#source_list").removeClass('required_second_page_of_form').addClass('dummy');
            $('#custom_source').show();
            $fieldsOfSecondPageOfForm = $(".required_second_page_of_form");
        }
        else {
            $('#custom_source').hide();
            $('#custom_source').val('');
            $('#custom_source').removeClass('required_second_page_of_form').addClass('dummy');
            $("#source_list").removeClass('dummy').addClass('required_second_page_of_form');
            $fieldsOfSecondPageOfForm = $(".required_second_page_of_form");
        }

        if (($(this).val() == 'Referral')) {
            $('#referrer_name').removeClass('dummy').addClass('required_second_page_of_form');
            $("#source_list").removeClass('required_second_page_of_form').addClass('dummy');
            $('#referrer_name').show();
            $fieldsOfSecondPageOfForm = $(".required_second_page_of_form");
        }
        else {
            $('#referrer_name').hide();
            $('#referrer_name').val('');
            $('#referrer_name').removeClass('required_second_page_of_form').addClass('dummy');
            $("#source_list").removeClass('dummy').addClass('required_second_page_of_form');
            $fieldsOfSecondPageOfForm = $(".required_second_page_of_form");
        }

        refreshRequiredFieldsOfSecondPageOfForm();

        validateSecondPageOfForm();

    });


    //Listen to checkbox Changes

    function attachLanguageCheckboxListener() {
        $('input[name=language]').change(function () {
            validateSecondPageOfForm();
        });
    }

    //Listen to Radio Button Changes

    function addStudOrGradRadioButtonListener() {
        $('input[name=stud_or_grad]').change(function () {
            validateSecondPageOfForm();
        });
    }


    // Upload form details Network call
    $("#submit").click(function () {


        $('#submit').removeClass('action-button_active').addClass('action-button_inactive');
        $('#submit').prop('disabled', true);
        $('#submit').text("Submitting...");

        var fd = new FormData();


        var full_name = $('#full_name').val();
        var phone_number = $('#phone_number').val();
        var email = $('#email').val();
        var graduation_year = $('#year :selected').text();


        var selectedLangs = [];
        var selectedLangsIds = [];
        $("input[name='language']:checked").each(function () {
            selectedLangs.push($(this).val());
        });

        for (var i = 0; i < selectedLangs.length; i++) {
            selectedLangsIds[i] = language_list_response[selectedLangs[i]];
        }
        var selectedLangsIdsString = selectedLangsIds.join(',');
        fd.append("list_of_languages", selectedLangsIdsString);
        console.log("List of languages " + selectedLangsIdsString);


        if (sessionStorage.getItem("provider_parameter") == "email") {
            fd.append("primary_email", sessionStorage.getItem("unique_identifier"));
            // console.log("provider parameter " + sessionStorage.getItem("unique_identifier"));

        } else if (sessionStorage.getItem("provider_parameter") == "uid") {
            fd.append("uid", sessionStorage.getItem("unique_identifier"));
            // console.log("provider parameter " + sessionStorage.getItem("unique_identifier"));
            fd.append("access_token", sessionStorage.getItem("hl_fb_login_access_token"));
        }


        fd.append("full_name", full_name);
        console.log("Full Name " + full_name);

        fd.append("graduation_year", graduation_year);
        console.log("Grad year " + graduation_year);


        fd.append("email", email);
        console.log("Email " + email);


        fd.append("phone_number", phone_number);
        console.log("Ph no " + phone_number);


        var college_selected = $('#college_list :selected').text();
        var degree_selected = $('#degree_list :selected').text();
        var source_selected = $('#source_list :selected').text();


        if (college_selected == "Other") {
            fd.append("college_name", $('#custom_college').val());
            console.log("college Name " + $('#custom_college').val());

        } else {
            fd.append("college_id", college_list_response[college_selected]);
            console.log("college Id " + college_list_response[college_selected]);

        }

        if (degree_selected == "Other") {
            fd.append("degree_name", $('#custom_degree').val());
            console.log("Degree Name " + $('#custom_degree').val());
        } else {
            fd.append("degree_id", degree_list_response[degree_selected]);
            console.log("Degree ID " + degree_list_response[degree_selected]);

        }

        if (source_selected == "Other") {
            fd.append("source_name", $('#custom_source').val());
            console.log("source name " + $('#custom_source').val());


        } else if (source_selected == "Referral") {
            fd.append("source", source_selected);
            fd.append("referrer_name", $('#referrer_name').val());

            console.log("source - " + source_selected);
            console.log("Referrer Name - " + $('#referrer_name').val());

        }
        else {
            fd.append("source", source_selected);
            console.log("source" + source_selected);
        }

        if ($('#student').is(':checked')) {
            fd.append("student_or_graduate", "student");
            console.log("Stud or grade" + "student");

        } else {
            fd.append("student_or_graduate", "graduate");
            console.log("Stud or grade - " + "graduate");

        }

        //Make the call

        $.ajax({
            url: BASE_URL + "v2/api/tutor_corner/update_tutor_profile/",
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            success: function (response) {

                // console.log(response.email);

                sessionStorage.setItem("hl_pk_email", response.email);

                if (response.status == "success" && response.state == 2) {
                    window.location.href = "views/policyVideoPage.html";
                }
                else {
                    sweetAlert("", "Error updating your profile.\nPlease send us an email to teach@hashlearn.com or call us on +91-7676210202.", "error");
                }

            },
            error: function (jqXHR, textStatus, errorMessage) {
                console.log(errorMessage); // Optional
                sweetAlert("", "Something went wrong in uploading your profile", "error");
                $('#submit').removeClass('action-button_inactive').addClass('action-button_active');
                $('#submit').prop('disabled', false);
            }
        });

        //End of the call


    });


});
