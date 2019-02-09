import Clndr from "../dist/clndr.js";
import { DateTime } from "luxon";

var clndr = {};

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

ready(() => {
    // Set up the events array
    var eventsArray = [
        {
            title: 'This is an Event',
            date: DateTime.local().toFormat('yyyy-MM-') + '07'
        }, {
            title: 'Another Event',
            date: DateTime.local().toFormat('yyyy-MM-') + '23'
        }
    ];

    // Default
    // =========================================================================
    clndr.defaultSetup = new Clndr(document.querySelector('#default'));

    // Test showAdjacentMonths and adjacentDaysChangeMonth.
    // Edges of other months should be visible and clicking them should switch
    // the month.
    // =========================================================================
    clndr.adjacent = new Clndr(document.querySelector('#adjacent'), {
        showAdjacentMonths: true,
        adjacentDaysChangeMonth: true
    });

    // Pass in a template
    // =========================================================================
    clndr.passInATemplate = new Clndr(document.querySelector('#pass-in-a-template'), {
        template: document.querySelector('#clndr-template').innerHTML
    });

    // Pass in events
    // =========================================================================
    clndr.passInEvents = new Clndr(document.querySelector('#pass-in-events'), {
        events: eventsArray
    });

    // Test the clickEvent callbacks
    // =========================================================================
    clndr.callbacks = new Clndr(document.querySelector('#callbacks'), {
        ready: function () {
            console.log('The callbacks calendar just called ready()');
        },
        clickEvents: {
            click: function (target) {
                console.log('click');
            },
            today: function (month) {
                console.log('today');
            },
            nextYear: function (month) {
                console.log('next year');
            },
            nextMonth: function (month) {
                console.log('next month');
            },
            previousYear: function (month) {
                console.log('previous year');
            },
            onYearChange: function (month) {
                console.log('on year change');
            },
            previousMonth: function (month) {
                console.log('previous month');
            },
            onMonthChange: function (month) {
                console.log('on month change');
            }
        },
        doneRendering: function () {
            console.log('The callbacks calendar just called doneRendering()');
        }
    });

    // Test multi-day events
    // =========================================================================
    const multidayArray = [
        {
            title: 'Multi1',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '17',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '12'
        }, {
            title: 'Multi2',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '27',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '24'
        }
    ];

    console.debug("multi", multidayArray);

    clndr.multiday = new Clndr(document.querySelector('#multiday'), {
        events: multidayArray,
        multiDayEvents: {
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            }
        }
    });

    // Test multi-day events
    // =========================================================================
    const multidayMixedArray = [
        {
            title: 'Multi1',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '17',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '12'
        }, {
            title: 'Multi2',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '27',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '24'
        }, {
            title: 'Single',
            date: DateTime.local().toFormat('yyyy-MM-') + '19'
        }
    ];

    clndr.multidayMixed = new Clndr(document.querySelector('#multiday-mixed'), {
        events: multidayMixedArray,
        multiDayEvents: {
            singleDay: 'date',
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            }
        }
    });

    // Test multi-day event performance
    // =========================================================================
    // Start with two truly multiday events.
    const multidayMixedPerfArray = [
        {
            title: 'Multi1',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '17',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '12'
        }, {
            title: 'Multi2',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '27',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '24'
        }
    ];

    // Add ten events every day this month that are only a day long,
    // which triggers clndr to use a performance optimization.
    const daysInMonth = DateTime.local().daysInMonth;

    for (var i = 1; i <= daysInMonth; i++) {
        var padDay = (i < 10)
            ? '0' + i
            : i;
        for (var j = 0; j < 10; j++) {
            multidayMixedPerfArray.push({
                endDate: DateTime.local().toFormat('yyyy-MM-') + padDay,
                startDate: DateTime.local().toFormat('yyyy-MM-') + padDay
            });
        }
    }

    // Start timer
    const start = DateTime.local();

    clndr.multidayMixedPerformance = new Clndr(document.querySelector('#multiday-mixed-performance'), {
        events: multidayMixedPerfArray,
        multiDayEvents: {
            singleDay: 'date',
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            }
        }
    });

    // Capture the end time
    const performanceSeconds = DateTime.local().diff(start, 'seconds').toObject()["seconds"];

    document.querySelector('#multiday-mixed-performance-val').textContent = performanceSeconds;

    // Test really long multi-day events
    // =========================================================================
    const multidayLongArray = [
        {
            title: 'Multi1',
            endDate: DateTime.local().toFormat('yyyy-MM-') + '17',
            startDate: DateTime.local().minus({ months: 3 }).toFormat('yyyy-MM-') + '12'
        }, {
            title: 'Multi2',
            startDate: DateTime.local().toFormat('yyyy-MM-') + '24',
            endDate: DateTime.local().plus({ months: 4 }).toFormat('yyyy-MM-') + '27'
        }
    ];

    clndr.multidayLong = new Clndr(document.querySelector('#multiday-long'), {
        events: multidayLongArray,
        multiDayEvents: {
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            }
        }
    });

    // Test constraints
    // The 4th of this month to the 12th of next month
    // =========================================================================
    clndr.constraints = new Clndr(document.querySelector('#constraints'), {
        constraints: {
            startDate: DateTime.local().toFormat('yyyy-MM-') + '04',
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-12')
        },
        clickEvents: {
            click: function (target) {
                if (!target.element.classList.includes('inactive')) {
                    console.log('You picked a valid date.');
                } else {
                    console.log('You can\'t pick that date.');
                }
            }
        }
    });

    // Test constraints
    // The 22nd of previous month to the 5th of next month
    // =========================================================================
    clndr.prevNextMonthConstraints = new Clndr(document.querySelector('#prev-next-month-constraints'), {
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-05'),
            startDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-') + '22'
        }
    });

    // Test constraints
    // The 2nd to the 5th of previous month
    // =========================================================================
    clndr.prevMonthConstraints = new Clndr(document.querySelector('#prev-month-constraints'), {
        constraints: {
            endDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-05'),
            startDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-') + '02'
        }
    });

    // Test constraints
    // The 22nd to the 25th of next month
    // =========================================================================
    clndr.nextMonthConstraints = new Clndr(document.querySelector('#next-month-constraints'), {
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-25'),
            startDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-') + '22'
        }
    });

    // Test the start constraint by itself (4th of this month)
    // =========================================================================
    clndr.startConstraint = new Clndr(document.querySelector('#start-constraint'), {
        constraints: {
            startDate: DateTime.local().toFormat('yyyy-MM-') + '04'
        }
    });

    // Test the end constraint by itself (12th of next month)
    // =========================================================================
    clndr.endConstraint = new Clndr(document.querySelector('#end-constraint'), {
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-') + '12'
        }
    });

    // Test API
    // You could do this with any instance but this makes for a nice reminder
    // =========================================================================
    clndr.api = new Clndr(document.querySelector('#api'), {
        clickEvents: {
            onMonthChange: function (month) {
                console.log('onMonthChange was called.');
            },
            onYearChange: function (month) {
                console.log('onYearChange was called.');
            }
        }
    });

    // Test forceSixRows option
    // =========================================================================
    clndr.sixRows = new Clndr(document.querySelector('#six-rows'), {
        forceSixRows: true
    });

    // Test options.classes
    // =========================================================================
    clndr.customClasses = new Clndr(document.querySelector('#custom-classes'), {
        events: eventsArray,
        classes: {
            past: "my-past",
            today: "my-today",
            event: "my-event",
            inactive: "my-inactive",
            lastMonth: "my-last-month",
            nextMonth: "my-next-month",
            adjacentMonth: "my-adjacent-month"
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            }
        }
    });

    // Test lengthOfTime.months option (three month views in one)
    // =========================================================================
    clndr.threeMonths = new Clndr(document.querySelector('#three-months'), {
        template: document.querySelector('#clndr-multimonth-template').innerHTML,
        lengthOfTime: {
            months: 3,
            interval: 1,
            startDate: DateTime.local().minus({ months: 1 }).startOf('month')
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            },
            previousInterval: function (start, end) {
                console.log('previous interval:', start, end);
            },
            nextInterval: function (start, end) {
                console.log('next interval:', start, end);
            },
            onIntervalChange: function (start, end) {
                console.log('interval change:', start, end);
            }
        }
    });

    // Test lengthOfTime.months option (three month views in one)
    // =========================================================================
    clndr.threeMonthsWithEvents = new Clndr(document.querySelector('#three-months-with-events'), {
        template: document.querySelector('#clndr-multimonth-template').innerHTML,
        events: multidayArray,
        lengthOfTime: {
            months: 3,
            interval: 1,
            startDate: DateTime.local().minus({ months: 1 }).startOf('month')
        },
        multiDayEvents: {
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            },
            previousInterval: function (start, end) {
                console.log('previous interval:', start, end);
            },
            nextInterval: function (start, end) {
                console.log('next interval:', start, end);
            },
            onIntervalChange: function (start, end) {
                console.log('interval change:', start, end);
            }
        }
    });

    // Test lengthOfTime.months option (three month views in one)
    // =========================================================================
    clndr.threeMonthsWithConstraints = new Clndr(document.querySelector('#three-months-with-constraints'), {
        template: document.querySelector('#clndr-multimonth-template').innerHTML,
        events: multidayArray,
        lengthOfTime: {
            months: 3,
            interval: 1,
            startDate: DateTime.local().minus({ months: 1 }).startOf('month')
        },
        multiDayEvents: {
            endDate: 'endDate',
            startDate: 'startDate'
        },
        clickEvents: {
            click: function (target) {
                console.log(target);
            },
            previousInterval: function (start, end) {
                console.log('previous interval:', start, end);
            },
            nextInterval: function (start, end) {
                console.log('next interval:', start, end);
            },
            onIntervalChange: function (start, end) {
                console.log('interval change:', start, end);
            }
        },
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-12'),
            startDate: DateTime.local().minus({ months: 2 }).toFormat('yyyy-MM-dd')
        }
    });

    // Test lengthOfTime.days option (14 days incremented by 7)
    // =========================================================================
    clndr.twoWeeks = new Clndr(document.querySelector('#one-week'), {
        template: document.querySelector('#clndr-oneweek-template').innerHTML,
        lengthOfTime: {
            days: 14,
            interval: 7,
            startDate: DateTime.local().set({weekday: 0})
        }
    });

    // Test lengthOfTime.days option (14 days incremented by 7)
    // =========================================================================
    clndr.twoWeeksWithConstraints = new Clndr(document.querySelector('#one-week-with-constraints'), {
        template: document.querySelector('#clndr-oneweek-template').innerHTML,
        events: multidayArray,
        multiDayEvents: {
            endDate: 'endDate',
            startDate: 'startDate'
        },
        lengthOfTime: {
            days: 14,
            interval: 7,
            startDate: DateTime.local().set({ weekday: 0 })
        },
        constraints: {
            startDate: DateTime.local().toFormat('yyyy-MM-04'),
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-12')
        }
    });

    // Test lengthOfTime.days option with constraints (14 days incremented by 7)
    // The 2nd to the 5th of previous month
    // =========================================================================
    clndr.twoWeeksWithPrevMonthConstraints = new Clndr(document.querySelector('#one-week-with-prev-month-constraints'), {
        template: document.querySelector('#clndr-oneweek-template').innerHTML,
        lengthOfTime: {
            days: 14,
            interval: 7,
            startDate: DateTime.local().set({ weekday: 0 })
        },
        constraints: {
            endDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-05'),
            startDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-02')
        }
    });

    // Test lengthOfTime.days option with constraints (14 days incremented by 7)
    // The 22nd to the 25th of next month
    // =========================================================================
    clndr.twoWeeksWithNextMonthConstraints = new Clndr(document.querySelector('#one-week-with-next-month-constraints'), {
        template: document.querySelector('#clndr-oneweek-template').innerHTML,
        lengthOfTime: {
            days: 14,
            interval: 7,
            startDate: DateTime.local().set({ weekday: 0 })
        },
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-25'),
            startDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-22')
        }
    });

    // Test selectedDate option
    // =========================================================================
    clndr.selectedDate = new Clndr(document.querySelector('#selected-date'), {
        trackSelectedDate: true,
        template: document.querySelector('#clndr-template').innerHTML
    });

    // Test selectedDate option with ignoreInactiveDaysInSelection
    // =========================================================================
    clndr.selectedDateIgnoreInactive = new Clndr(document.querySelector('#selected-date-ignore-inactive'), {
        template: document.querySelector('#clndr-template').innerHTML,
        trackSelectedDate: true,
        ignoreInactiveDaysInSelection: true,
        constraints: {
            endDate: DateTime.local().plus({ months: 1 }).toFormat('yyyy-MM-12'),
            startDate: DateTime.local().minus({ months: 1 }).toFormat('yyyy-MM-dd')
        }
    });
});