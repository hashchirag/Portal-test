/**
 * Created by chiragshenoy on 08/06/16.
 */
(function ($) {
    $.fn.emc = function (options) {

        //15 Mins of time

        var countDownTime = 900;
        // var countDownTime = 20;
        

        // If his state is not equal to 2 , send him back to splash page.
        $.ajax({
            async: false,
            type: 'GET',
            url: BASE_URL + "v2/api/tutor_corner/get_tutor_status/?" + sessionStorage.getItem("provider_parameter") + "=" + sessionStorage.getItem("unique_identifier"),
            success: function (data) {

                console.log("Personality Test " + data);

                //Redirect to main page because the user state is not 1.
                if (data.state != 2) {
                    window.location.href = "../index.html";
                }
            }
        });


        var defaults = {
                key: [],
                scoring: "normal",
                progress: true
            },
            settings = $.extend(defaults, options),
            $quizItems = $('[data-quiz-item]'),
            $choices = $('[data-choices]'),
            itemCount = $quizItems.length,
            chosen = [],
            $option = null,
            $label = null;

        var count = 0;

        emcInit();

        //Timer part
        function CountDown(container, time) {
            this.container = container;
            this.display = container.querySelector('.timer-display');
            this.bar = container.querySelector('.timer-bar');
            this.time = time;
            this.remainingTime = this.time;
            this.elapsedTime = 0;

            this.updateDisplay();
        }

        CountDown.fn = CountDown.prototype;

        CountDown.fn.updateCounters = function () {
            this.remainingTime -= 1;
            this.elapsedTime += 1;

            //Case of time ended. Display Results
            if (this.remainingTime == -1) {
                $('#canvasID').hide();
                scoreNormal();
            }

        };

        CountDown.fn.updateDisplay = function () {
            this.display.innerText = "Remaining Time: " + parseInt(this.remainingTime / 60, 10) + ':' + ('0' + (this.remainingTime % 60)).substr(-2);
        };

        CountDown.fn.updateCanvasColor = function () {
            var remainingTimePercentage = this.remainingTime / this.time;
            var transition, duration;

            if (remainingTimePercentage <= 0.7) {
                transition = 'green-to-orange';
                duration = 0.2 * this.time;
            }

            if (remainingTimePercentage <= 0.5) {
                transition = 'orange-to-yellow';
                duration = 0.1 * this.time;
            }

            if (remainingTimePercentage <= 0.4) {
                transition = 'yellow-to-red';
                duration = 0.4 * this.time;
            }

            if (transition && duration) {
                this.container.style['-webkit-animation-duration'] = duration + 's';
                this.container.classList.add(transition);
            }
        };

        CountDown.fn.updateBarWidth = function () {
            // this.bar.style.width = (this.elapsedTime / this.time * 100) + '%';
        };

        CountDown.fn.checkFinalTime = function () {
            if (this.remainingTime === 10) {
                this.display.classList.add('finishing');
            }
        };

        CountDown.fn.init = function () {
            var tid = setInterval(function () {
                if (this.remainingTime === -1) {
                    return clearInterval(tid);
                }

                this.updateCounters();
                this.updateDisplay();
                this.updateCanvasColor();
                this.updateBarWidth();
                this.checkFinalTime();
            }.bind(this), 1000);

            // this.button.innerText = 'Done!';
        };


        var mCountDownTimer = new CountDown(document.querySelector('.canvas'), countDownTime);
        mCountDownTimer.init();
        //End of timer

        if (settings.progress) {
            var $bar = $('#emc-progress'),
                $inner = $('<div id="emc-progress_inner"></div>'),
                $perc = $('<span id="emc-progress_ind">0/' + itemCount + '</span>');
            $bar.append($inner).prepend($perc);
        }

        function emcInit() {
            $quizItems.each(function (index, value) {
                var $this = $(this),
                    $choiceEl = $this.find('.choices'),
                    choices = $choiceEl.data('choices');
                for (var i = 0; i < choices.length; i++) {
                    $option = $('<input name="' + index + '" id="' + index + '_' + i + '" type="radio">');
                    $label = $('<label for="' + index + '_' + i + '">' + choices[i] + '</label>');
                    $choiceEl.append($option).append($label);

                    $option.on('change', function () {
                        return getChosen();
                    });
                }
            });
        }

        function getChosen() {
            chosen = [];
            $choices.each(function () {
                var $inputs = $(this).find('input[type="radio"]');
                $inputs.each(function (index, value) {
                    if ($(this).is(':checked')) {
                        chosen.push(index + 1);
                    }
                });
            });
            getProgress();
        }

        function getProgress() {
            var prog = (chosen.length / itemCount) * 100 + "%",
                $submit = $('#emc-submit');
            if (settings.progress) {
                $perc.text(chosen.length + '/' + itemCount);
                $inner.css({
                    height: prog
                });
            }
            if (chosen.length === itemCount) {
                $submit.addClass('ready-show');
                $submit.click(function () {
                    $('#canvasID').hide();

                    return scoreNormal();
                });
            }
        }

        function scoreNormal() {

            $('#emc-submit').hide();

            var wrong = [],
                score = null,
                $scoreEl = $('#emc-score');
            for (var i = 0; i < itemCount; i++) {
                if (chosen[i] != settings.key[i]) {
                    wrong.push(i);
                }
            }
            $quizItems.each(function (index) {
                var $this = $(this);
                if ($.inArray(index, wrong) !== -1) {
                    $this.removeClass('item-correct').addClass('item-incorrect');
                } else {
                    $this.removeClass('item-incorrect').addClass('item-correct');
                }
            });
            score = ((itemCount - wrong.length) / itemCount).toFixed(2) * 100 + "%";

            $('html,body').animate({
                scrollTop: 0
            }, 50);
            if (count == 0) {
                // var http = new XMLHttpRequest();
                var url = BASE_URL + "/v2/api/tutor_corner/tutor_personality_test_results/";
                var correct = (itemCount - wrong.length);

                //New network call
                $.post(url,
                    {
                        email: sessionStorage.getItem("hl_pk_email"),
                        questions_attempted: "10",
                        questions_correct: correct,
                        test_type: "Personality"
                    },
                    function (data, status) {

                        //Case of pass
                        if (data.state == 3) {

                            $scoreEl.html("You scored a " + score + "<br />" + "<a class = 'next'>Go to the Dashboard</a>").addClass('new-score');

                            $scoreEl.click(function () {
                                window.location.href = "dashboard.html";
                            });
                        }
                        //Case of fail
                        else if (data.state == 4) {
                            $scoreEl.html("You scored a " + score + "<br />" + "<a class = 'next'>Proceed</a>").addClass('new-score');
                            $scoreEl.click(function () {
                                window.location.href = "sorry.html";
                            });
                        }
                        else {
                            alert("You have already taken this test before.");
                        }

                    });
                //End of new network call


                count = count + 1;
            }

            $('#emc-submit').removeClass('ready-show');

        }

    }
}(jQuery));


$(document).emc({
    key: ["3", "3", "2", "4", "4", "2", "4", "4", "2", "1"]
});
