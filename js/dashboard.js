// create the module and name it scotchApp
var dashboardApp = angular.module('dashboardApp', ['ngRoute']);

// configure our routes
dashboardApp.config(function ($routeProvider) {
    $routeProvider

    // route for the home page
        .when('/', {
            templateUrl: 'profile_dashboard.html',
            controller: 'profileController'
        })

        // route for the about page
        .when('/tests', {
            templateUrl: 'tests_dashboard.html',
            controller: 'testController'
        })

        .when('/payment', {
            templateUrl: 'payment_dashboard.html',
            controller: 'paymentController'
        })

        // route for the contact page
        .when('/topics', {
            templateUrl: 'topics_dashboard.html',
            controller: 'topicController'
        });
});

// create the controller and inject Angular's $scope
dashboardApp.controller('profileController', function ($scope, $http) {
    // create a message to display in our view

    (function blink() {
        $('#test_icon').fadeOut(800).fadeIn(800, blink);
        $('#test_text_header').fadeOut(800).fadeIn(800, blink);

    })();

    $.ajax({
        async: false,
        type: 'GET',
        url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
        success: function (data) {

            // console.log(data.state);

            //Redirect to main page because the user state is not 1.
            if (data.state != 3 && data.state != 5) {
                if (data.state != 6)
                    window.location.href = "../index.html";
            }
            sessionStorage.setItem('hl_pk_email', data.email);
        }
    });


    $("#pan_details").css("visibility", "hidden");
    $("#bank_details").css("visibility", "hidden");


    function getUserDetails() {
        $http({
            method: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/get_profile_details/?email=" + sessionStorage.getItem('hl_pk_email')
        }).then(function successCallback(response) {

            //Populate the fields
            if (response.data.state == "success") {

                $('#user_name').text(response.data.first_name + " " + response.data.last_name);

                //this is to pre populate in class marker opening page
                sessionStorage.setItem('hl_user_name', response.data.first_name + " " + response.data.last_name);

                //Filling up the user details
                $('#user_name_header').text(response.data.first_name);
                $('#user_college').text(response.data.college);
                $('#user_degree').text(response.data.degree);
                $('#user_email').text(response.data.email);
                $('#user_phone').text(response.data.mobile_number);
                $('#user_rating').text(response.data.student_rating);

                // Get information if he is a student or graduate
                $scope.student_graduate = response.data.student_graduate;

                if (response.data.student_graduate == "graduate") {
                    $('#image_text').text('Upload image of your latest graduation certificate');
                    getImageUploadedStatus();

                }
                else if (response.data.student_graduate == "student") {
                    $('#image_text').text('Upload image of your ID Card');
                    getImageUploadedStatus();
                }

            }
            else {
                sweetAlert("", "Error in Fetching profile information", "error");
            }


        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            sweetAlert("", "Something went wrong in getting profile data", "error");
            console.log(response);

        });

    }

    //This is called in the start by default, to get details if he has uploaded his id card/pan card details and bank details
    function getImageUploadedStatus() {
        $http({
            method: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/get_bank_pan_status/?email=" + sessionStorage.getItem('hl_pk_email')
        }).then(function successCallback(response) {
                //Populate the fields
                if (response.data.state == "success") {

                    //If he is a student
                    if (response.data.student_graduate == "student") {

                        if (response.data.id_card_uploaded == false) {
                            $('#image_section').show();
                        } else {
                            $('#image_form').hide();
                            $('#image_text').css({'width': '520px'});
                            $('#image_text').css({'text-align': 'center'});
                            $('#image_text').css({'margin-top': '15px'});
                            $('#image_text').text('You have already uploaded your ID Card');
                            $('#save_image').hide();
                        }
                    }

                    // If he is a graduate
                    else if (response.data.student_graduate == "graduate") {
                        if (response.data.graduate_marksheet == false) {
                            $('#image_section').show();

                        } else {
                            $('#image_text').css({'width': '520px'});
                            $('#image_text').css({'text-align': 'center'});
                            $('#image_text').css({'margin-top': '15px'});
                            $('#image_form').hide();
                            $('#image_text').text('You have already uploaded your Marksheet');
                            $('#save_image').hide();
                        }
                    }

                    var show_horizontal_line = false;


                    //This is the case of bank details NOT YET uploaded
                    if (response.data.bank_details == false) {
                        $('#payment_div').show();
                        show_horizontal_line = true;

                    }
                    //This is the case of bank details uploaded
                    else {
                        $('#payment_text').css({'color': 'gray'});
                        $('#payment_text').css({'padding-top': '10px'});
                        $('#payment_div').css({'cursor': 'default'});

                        $('#payment_text').text('You have filled your bank details');
                        $('#payment_div').click(false);
                    }

                    //This is the case of PAN details NOT YET uploaded

                    if (response.data.pan_card_uploaded == false) {
                        $('#pan_div').show();
                        show_horizontal_line = true;
                    }
                    //This is the case of PAN details uploaded
                    else {
                        $('#pan_text').css({'color': 'gray'});
                        $('#pan_text').css({'padding-top': '10px'});
                        $('#pan_div').css({'cursor': 'default'});
                        $('#pan_text').text('You have filled your PAN details')
                        $('#pan_div').click(false);

                    }

                    if (!show_horizontal_line) {
                        $('#line_after_bank_and_pan_section').hide();
                    }
                }
                else {
                    sweetAlert("", "Error in Fetching profile information", "error");
                }
            },
            function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                sweetAlert("", "Something went wrong in getting bank and pan status data", "error");
                console.log(response);

            }
        );
    }


    function fileUploadSetUp() {
        $('#pan_input').change(function () {
            //console.log(this.files);
            var f = this.files;
            var el = $(this).parent();
            if (f.length > 1) {
                // console.log(this.files, 1);
                el.text('Sorry, multiple files are not allowed');
                return;
            }

            $scope.panToUpload = f[0];

            $('#pan_name').text(f[0].name);

            el.removeClass('focus');
        });

        $('#pan_input').on('focus', function () {
            $(this).parent().addClass('focus');
        });

        $('#pan_input').on('blur', function () {
            $(this).parent().removeClass('focus');
        });


        $('#image_input').change(function () {
            //console.log(this.files);
            var f = this.files;
            var el = $(this).parent();
            if (f.length > 1) {
                // console.log(this.files, 1);
                el.text('Sorry, multiple files are not allowed');
                return;
            }

            //Making the save Button Green
            $("#save_image").removeClass('inactivesave');
            $("#save_image").addClass('activesave');


            $scope.imageToUpload = f[0];
            $('#file_name').css({'padding-top': '20px'});
            $('#file_name').text(f[0].name);

            el.removeClass('focus');
        });

        $('#image_input').on('focus', function () {
            $(this).parent().addClass('focus');
        });

        $('#image_input').on('blur', function () {
            $(this).parent().removeClass('focus');
        });
    }


    // Click handler for Save Button of Main Form (ID CARD OR MARKSHEET)
    $("#save_image").click(function () {


        var fd = new FormData();

        //Chek if image is empty, if its not empty, go ahead and upload it.
        if ($scope.imageToUpload) {

            $('#save_image_btn_text').text("Saving ...");


            if ($scope.student_graduate == "student") {
                fd.append('image_front', $scope.imageToUpload);
            }
            else {
                fd.append('image_marksheet', $scope.imageToUpload);
            }
            fd.append('email', sessionStorage.getItem('hl_pk_email'));

            $.ajax({
                url: BASE_URL + "v2/api/tutor_corner/id_card/",
                type: "POST",
                data: fd,
                processData: false,
                contentType: false,
                success: function (response) {

                    if (response.state == "success") {

                        if ($scope.student_graduate == "student") {
                            $('#image_form').hide();
                            $('#image_text').css({'width': '480px;margin-top:20px'});
                            $('#image_text').css({'text-align': 'center'});
                            $('#image_text').text('You have successfully uploaded your ID Card');
                            $('#save_image').hide();
                        } else if ($scope.student_graduate == "graduate") {
                            $('#image_text').css({'width': '480px'});
                            $('#image_text').css({'text-align': 'center'});
                            $('#image_form').hide();
                            $('#image_text').text('You have successfully uploaded your Marksheet');
                            $('#save_image').hide();
                        }

                    }
                    else {
                        sweetAlert("", "Failed uploading image", "error");
                    }

                },
                error: function (jqXHR, textStatus, errorMessage) {
                    console.log(errorMessage); // Optional
                    sweetAlert("", 'Image Upload Failed', "error");
                }
            });
        } else {
            sweetAlert("", 'Please upload the image', "error");
        }
    });

    //This is called when SAVE button in the bank details modal is clicked.
    function uploadBankDetails(ifsc, account_no, payee_name) {

        var data = $.param({
            ifsc_code: ifsc,
            account_number: account_no,
            name: payee_name,
            email: sessionStorage.getItem('hl_pk_email')
        });


        $http({
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'POST',
            data: data,
            url: BASE_URL + "v2/api/tutor_corner/bank_details/"
        }).then(function successCallback(response) {
            if (response.data.state == "success") {
                $('#payment_div').click(false);
                $('#payment_text').text("You have successfully uploaded your Bank Details");
                $('#bankModal').modal('toggle');
                $('#payment_text').css({'margin-top': '20px'});
                $('#payment_div').css({'cursor': 'default'});

            } else {
                sweetAlert("", 'Failed uploading Bank Details', "error");
            }

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            sweetAlert("", "Something went wrong in saving bank details", "error");

        });

    }

    //This is called when SAVE button in the PAN details modal is clicked.

    function uploadPanDetails(pan_no) {

        var fd = new FormData();

        fd.append("pan_card", $scope.panToUpload);
        fd.append("pan_no", pan_no);
        fd.append("email", sessionStorage.getItem('hl_pk_email'));

        $.ajax({
            url: BASE_URL + "v2/api/tutor_corner/pan_card_details/",
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            success: function (response) {

                if (response.state == "success") {
                    $('#pan_text').text("You have successfully uploaded your PAN Details");
                    $('#panModal').modal('toggle');
                    $('#pan_text').css({'margin-top': '20px'});
                    $('#pan_div').click(false);
                    $('#pan_div').css({'cursor': 'default'});
                }
                else {
                    sweetAlert("", "Failed uploading PAN Details", "error");
                }

            },
            error: function (jqXHR, textStatus, errorMessage) {
                console.log(errorMessage); // Optional
                sweetAlert("", 'Something went wrong in saving PAN details', "error");
            }
        });

    }


    //This is for listening to change in input , Validation. Not actually needed
    $("#bank_details input[type='text']").on('input', function () {
        // Check input( $( this ).val() ) for validity here
        var ifsc = $('#ifsc').val();
        var bank_no = $('#bank_no').val();
        var bank_no_verify = $('#bank_no_verify').val();
        var payee_name = $('#payee_name').val();

        if (ifsc && bank_no && bank_no && (bank_no_verify == bank_no) && payee_name) {
            $('.submit_bank').removeClass('inactivesavebank');
            $('.submit_bank').addClass('activesavebank');
        }
        else {
            $('.submit_bank').addClass('inactivesavebank');
            $('.submit_bank').removeClass('activesavebank');
        }

    });

    // On click listener of Save in Bank Details Section, to trigger the network call
    $(".submit_bank").click(function () {

        var ifsc = $('#ifsc').val();
        var bank_no = $('#bank_no').val();
        var bank_no_verify = $('#bank_no_verify').val();
        var payee_name = $('#payee_name').val();

        var cansubmit = true;

        if (!ifsc) {
            cansubmit = false;
            sweetAlert("", 'Please enter IFSC Code', "error");
        }

        if (!bank_no) {
            cansubmit = false;
            sweetAlert("", 'Please enter Bank Account Number', "error");
        }

        if (!bank_no_verify) {
            cansubmit = false;
            sweetAlert("", 'Please enter Bank Account Number', "error");
        }

        if (!payee_name) {
            cansubmit = false;
            sweetAlert("", 'Please enter Payee name', "error");
        }

        if (bank_no != bank_no_verify) {
            cansubmit = false;
            sweetAlert("", 'The Bank Account Numbers dont match', "error");
        }

        if (cansubmit) {
            $('#bank_save_button_text').text("Saving Bank Details....", "error");
            uploadBankDetails(ifsc, bank_no, payee_name);
        }

    });

    // On click listener of Save in PAN Details Section, to trigger the network call
    $(".submit_pan").click(function () {

        var pan_number = $('#pan_number').val();

        var cansubmit = true;

        if (!pan_number) {
            cansubmit = false;
            sweetAlert("", 'Please enter PAN Number', "error");
        }

        if (!$scope.panToUpload) {
            cansubmit = false;
            sweetAlert("", 'Please upload PAN Card Image', "error");
        }

        if (cansubmit) {
            $('#pan_save_button_text').text("Saving PAN Details...", "error");
            uploadPanDetails(pan_number);
        }

    });

    //Modal Trigger
    $("#payment_div").click(function () {
        $("#bank_details").css("visibility", "visible");

    });

    $("#pan_div").click(function () {
        $("#pan_details").css("visibility", "visible");

    });


    getUserDetails();

    fileUploadSetUp();

    getImageUploadedStatus();

});


//This is the JS for the TESTS PAGE
dashboardApp.controller('testController', function ($scope, $http) {

    $(document).ready(function () {

        $.ajax({
            async: false,
            type: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
            success: function (data) {

                //Redirect to main page because the user state is not 1.
                if (data.state != 3 && data.state != 5) {
                    if (data.state != 6)
                        window.location.href = "../index.html";
                }
            }
        });

        //IN the beginning, hide these divs and assign width to the side Navigation
        $('#mFrame').hide();
        $('.exam_indicator').hide();
        document.getElementById("mySidenav").style.width = "250px";

        $scope.examID_and_link_ary = {};
        $scope.examID_and_name_ary = {};


        //Get list of Exams
        $http({
            method: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/list_of_exams/?email=" + sessionStorage.getItem("hl_pk_email")
        }).then(function successCallback(response) {

            $scope.count = 0;

            if(response.data.length == 0){
                $('#text').text("You have already taken up all tests. Head over to the topics section to add more topics.");
                $('#sidenav_exams').hide();
            }
            else{
                // This part populates the side navigation drawer.
                for (var i = 0; i < response.data.length; i++) {
                    $scope.examID_and_link_ary[response.data[i].id] = response.data[i].exam_link;
                    $scope.examID_and_name_ary[response.data[i].id] = response.data[i].placeholder_name;
                    $("#mySidenav").append('<div class="exams inactive" id="' + [response.data[i].id] + '">' + response.data[i].placeholder_name + '</div>');
                }
                // console.log($scope.examID_and_name_ary);

                //Adding click listeners
                $('div .exams').on('click', function () {
                    var id = $(this).attr('id');

                    $(this).addClass("active").siblings().removeClass("active");

                    $('#exam_text').text($scope.examID_and_name_ary[id]);


                    var url = $scope.examID_and_link_ary[id] + "&iframe=1&cm_user_id=" + sessionStorage.getItem('hl_pk_email') + "&cm_fn=" + sessionStorage.getItem('hl_user_name') + "&cm_e=" + sessionStorage.getItem('hl_pk_email');

                    if ($scope.count == 0) {
                        $('#text').remove();
                        $('#mFrame').show();
                        $('.exam_indicator').show();

                        $('<iframe>', {
                            src: url,
                            id: 'cmFrame',
                            frameborder: 0,
                            height: 600,
                            width: 800,
                            scrolling: 'yes'
                        }).appendTo('#mFrame');
                    } else {
                        var $iframe = $('#cmFrame');
                        $iframe.attr('src', url);
                    }

                    $scope.count = $scope.count + 1;

                });
            }


        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            sweetAlert("", "Something went wrong in getting exam list", "error");
            // console.log(response);


        });
        //End of getting list of exams
    });

});

dashboardApp.controller('topicController', function ($scope, $http) {
    $scope.message = 'Topics page is here!';
    $(document).ready(function () {

        $('#topics_text_helper').hide();

        $.ajax({
            async: false,
            type: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
            success: function (data) {

                //Redirect to main page because the user state is not 1.
                if (data.state != 3 && data.state != 5) {
                    if (data.state != 6)
                        window.location.href = "../index.html";
                }
            }
        });

        $('.exam_indicator').hide();
        $('#save').hide();

        document.getElementById("sidenav_topics").style.width = "250px";

        $scope.examID_and_name_ary = {};

        $scope.subjectID_and_name_ary = {};

        $scope.exam_counter = 0;

        $scope.topicID_and_name_ary = {};

        $scope.chapter_ids = [];

        function greyOutSelectedTopics(array_of_chapters_to_be_greyed) {

            for (var i = 0; i < array_of_chapters_to_be_greyed.length; i++) {
                $('#' + array_of_chapters_to_be_greyed[i]).removeClass('unselected');
                $('#' + array_of_chapters_to_be_greyed[i]).removeClass('selected');
                $('#' + array_of_chapters_to_be_greyed[i]).addClass('chosen');
                $('#' + array_of_chapters_to_be_greyed[i]).unbind("click");
            }

            $scope.chapter_ids = [];

        }


        function saveSelectedChapters() {
            $('#save_text').text("Saving...");

            var id_of_chapters_string = $scope.chapter_ids.join();

            var fd = new FormData();
            fd.append("email", sessionStorage.getItem('hl_pk_email'));
            fd.append("chapters", id_of_chapters_string);

            var data = $.param({
                email: sessionStorage.getItem('hl_pk_email'),
                chapters: id_of_chapters_string
            });


            $http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                method: 'POST',
                data: data,
                url: BASE_URL + "v2/api/tutor_corner/register_chapters_for_tutor/"
            }).then(function successCallback(response) {
                if (response.data.state == "success") {
                    greyOutSelectedTopics($scope.chapter_ids);
                    $('#save_text').text("Save");

                }

            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                sweetAlert("", "Something went wrong in saving chapters", "error");

            });
        }


        $("#save").click(function () {

            if ($scope.chapter_ids.length != 0) {
                saveSelectedChapters();
            }
            else {
                sweetAlert("", "Please chose atleast one available topic before saving", "error");
            }
        });

        //Helper Function to add or remove selected topics.
        function add_or_remove_subject(subject_id) {

            var index = $scope.chapter_ids.indexOf(subject_id);
            if (index > -1) {
                $scope.chapter_ids.splice(index, 1);
            }
            else {
                $scope.chapter_ids.push(subject_id);
            }

        }


        //This method is called each time he selects a subject. We "Grey out" or disable topics which has previously selected.
        function get_previously_selected_chapters(subject_id) {
            $http({
                method: 'GET',
                url: BASE_URL + "v2/api/tutor_corner/get_tutor_chapter/?email=" + sessionStorage.getItem('hl_pk_email') + "&pk=" + subject_id
            }).then(function successCallback(response) {
                // console.log(response.data);

                if (response.data.state == "success") {
                    var temp_topic_ids = [];
                    for (var i = 0; i < response.data.chapter.length; i++) {
                        temp_topic_ids.push(response.data.chapter[i]);
                    }
                    greyOutSelectedTopics(temp_topic_ids);

                } else if (response.data.state == "error") {
                    console.log('No previously selected chapters');
                }


            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                sweetAlert("", "Something went wrong in getting passed chapter list", "error");

            });
        }


        // Function for adding topics from the subject id
        function getTopicsFromSubjectId(subject_id) {
            $http({
                method: 'GET',
                url: BASE_URL + "v2/api/tutor_corner/subject_chapter_list/?pk=" + subject_id
            }).then(function successCallback(response) {
                $('#topics_text_helper').show();

                $('#save').show();

                $('#topic_container').empty();

                for (var i = 0; i < response.data.length; i++) {
                    $scope.topicID_and_name_ary[response.data[i].id] = response.data[i].name;
                    var r = $('<div class="btn color-1 unselected" id="' + response.data[i].id + '">' + response.data[i].name + '</div>');
                    $('#topic_container').append(r);
                }

                //Adding click listeners to each chapter
                $('.btn').on('click', function (e) {
                    var id = $(this).attr('id');
                    $(this).toggleClass('selected');
                    // console.log(id);

                    add_or_remove_subject(id);

                    e.preventDefault();
                });


                get_previously_selected_chapters(subject_id);

            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                sweetAlert("", "Something went in getting exam list", "error");

            });
        }

        //Function for adding subjects to the exams.
        function getSubjectsFromExamId(exam_id, id_of_parent) {
            $http({
                method: 'GET',
                url: BASE_URL + "v2/api/tutor_corner/subject_exam_list/?pk=" + exam_id
            }).then(function successCallback(response) {


                $scope.show_subject_helper_text = true;

                for (var i = 0; i < response.data.length; i++) {
                    $scope.subjectID_and_name_ary[response.data[i].id] = response.data[i].name;
                    $("#" + id_of_parent).append('<li class="subjects inactive" id="' + [response.data[i].id] + '">' + response.data[i].name + '</li>');
                }

                //This delay was needed because of syncronization issues. Did'nt not find any other solution.
                var delay = 500; //0.5 second

                setTimeout(function () {
                    //your code to be executed after 0.5 second
                    assignSubjectListeners();
                }, delay);


            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                sweetAlert("", "Something went in getting exam list", "error");

            });
        }

        //Assigning listeners to each subject in the side nav bar
        function assignSubjectListeners() {
            $('.inactive').on('click', function () {
                var topic_id = $(this).attr('id');


                $('ul[class="dropdown2-menu"] li').removeClass("active");
                $('ul[class="dropdown2-menu"] li').addClass("inactive");

                $(this).addClass("active");
                $(this).removeClass("inactive");

                $('#subject_text').text($scope.subjectID_and_name_ary[topic_id]);

                if ($scope.show_subject_helper_text) {
                    $('#text').remove();
                    $('.exam_indicator').show();
                }

                getTopicsFromSubjectId(topic_id);

                $scope.show_subject_helper_text = false;

            });
        }


        //Get list of Passed Exams
        $http({
            method: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/list_of_passed_exams/?email=" + sessionStorage.getItem('hl_pk_email')
        }).then(function successCallback(response) {

            $scope.countToDisplayOnce = true;

            if (response.data.state != "error") {

                // This part populates the side navigation drawer.
                for (var i = 0; i < response.data.length; i++) {
                    $scope.examID_and_name_ary[response.data[i].id] = response.data[i].placeholder_name;
                    $("#exam_subject_list").append('<li class="dropdown2" id="' + response.data[i].id + '"> <input type="checkbox" checked/> <a data-toggle="dropdown2"> ' + response.data[i].placeholder_name + '</a> <ul class="dropdown2-menu" id="' + i + '"</ul> </li>');
                    getSubjectsFromExamId(response.data[i].id, i);
                }

                //Adding click listeners
                $('ul .dropdown2').on('click', function () {
                    var id = $(this).attr('id');

                    $('#exam_text').text($scope.examID_and_name_ary[id]);


                    if ($scope.countToDisplayOnce) {
                        $('.subject_indicator').show();
                    } else {

                    }

                    $scope.countToDisplayOnce = false;
                });

            } else {
                // sweetAlert("","You have not passed any tests. Please head over to the tests section");
                $('#text').text("You have not passed any tests. Please head over to the tests section", "error");
                $('#exam_text_in_side_nav').hide();
            }


        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            sweetAlert("", "Something went in getting exam list", "error");

        });
        //End of getting list of exams
    });

});

dashboardApp.controller('paymentController', function ($scope, $http) {
    $scope.message = 'Payment page is here!';

    $.ajax({
        async: false,
        type: 'GET',
        url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
        success: function (data) {

            //Redirect to main page because the user state is not 1.
            if (data.state != 3 && data.state != 5) {
                if (data.state != 6)
                    window.location.href = "../index.html";
            }
        }
    });

    var payment_summary_url = BASE_URL + "v2/api/tutor_corner/payment_summary/?email=" + sessionStorage.getItem('hl_pk_email');

    //This call is related to the LEFT SECTION ( PAYMENT SUMMARY )
    $http({
        method: 'GET',
        url: payment_summary_url
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        // console.log(response.data);

        if (response.data.state == "success") {
            $('#total_base_earnings').text(response.data.total_base_earnings);
            $('#overall_peak_bonus').text(response.data.peak_bonus);
            $('#overall_rating_bonus').text(response.data.rating_bonus);
            $('#current_earnings').text(response.data.current_earnings);
            $('#tax_deducted').text(response.data.tax_deductable);
            $('#amount_payable').text(response.data.amount_payable);
            $('#total_amount_paid').text(response.data.total_amount_paid);

        }
        else {
            sweetAlert("", "Could not get Payment Summary", "error");
        }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        sweetAlert("", "Something went wrong in getting payment summary", "error");

    });


    var lesson_transaction_url = BASE_URL + "v2/api/tutor_corner/lesson_transaction/?email=" + sessionStorage.getItem('hl_pk_email');

    //This call is related to the RIGHT SECTION ( LESSON TRANSACTION SUMMARY )

    // Fixme - Pagination to be used in displaying the previous lessons.

    $http({
        method: 'GET',
        url: lesson_transaction_url
    }).then(function successCallback(response) {
        // console.log(response.data);

        //Bank End is not sending a success or failure response. Its just sending as an array.

        //Fixme - Ask backend to give a JSON response instead of array.

        if (response.data.length >= 1) {
            $('#no_previous_lessons').hide();
        }

        for (var i = 0; i < response.data.length; i++) {

            $(".transactions").append('<div class="row"> <div class="col-sm-6"> <div class="session_id">Session ID : ' + response.data[i].id + '</div> <div class="timers"> <i class="fa fa-clock-o" aria-hidden="true"></i> <span style="color: #00aa66">' + response.data[i].date.substring(0, 10) + ' </span> </span> <span style="margin-left: 20px"></span> <i class="fa fa-clock-o" aria-hidden="true"></i> <span style="color: #00aa66; margin-left: 2px">' + response.data[i].date.substring(11, 19) + '</span> </div> </div> <div class="col-sm-6 right"> <p><span style="color: darkgrey">student Name : </span>' + response.data[i].name + '</p> <p><span style="color: darkgrey">Topic : </span>' + response.data[i].topic + '</p> <p><span style="color: darkgrey">' + response.data[i].normal_transaction + ".<br/>" + response.data[i].override_transaction
                + '<div class="horizontal_line"></div> </div> </div>');
        }


    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        sweetAlert("", "Something went wrong in getting lesson transaction", "error");

    });


});