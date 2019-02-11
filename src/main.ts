import * as luxon from "luxon";
import { template, mergeWith } from "lodash-es";

const { DateTime, Info } = luxon;

// Defaults and helper methods
const defaultClndrTemplate =
  "<div class='clndr-controls'>" +
  "<div class='clndr-control-button'>" +
  "<span class='clndr-previous-button'>previous</span>" +
  "</div>" +
  "<div class='month'><%= month %> <%= year %></div>" +
  "<div class='clndr-control-button rightalign'>" +
  "<span class='clndr-next-button'>next</span>" +
  "</div>" +
  "</div>" +
  "<table class='clndr-table' border='0' cellspacing='0' cellpadding='0'>" +
  "<thead>" +
  "<tr class='header-days'>" +
  "<% for(var i = 0; i < daysOfTheWeek.length; i++) { %>" +
  "<td class='header-day'><%= daysOfTheWeek[i] %></td>" +
  "<% } %>" +
  "</tr>" +
  "</thead>" +
  "<tbody>" +
  "<% for(var i = 0; i < numberOfRows; i++){ %>" +
  "<tr>" +
  "<% for(var j = 0; j < 7; j++){ %>" +
  "<% var d = j + i * 7; %>" +
  "<td class='<%= days[d].classes %>'>" +
  "<div class='day-contents'><%= days[d].day %></div>" +
  "</td>" +
  "<% } %>" +
  "</tr>" +
  "<% } %>" +
  "</tbody>" +
  "</table>";

function closet(element: Element, selector: string): Element | null {
  if (element.closest) {
    return element.closest(selector);
  } else {
    let elem: Node | HTMLElement = element;
    while (elem && !matches(elem as HTMLElement, selector)) elem = elem.parentNode;
    return elem as HTMLElement;
  }
}

function matches(parent: Element, selector: string): boolean {
  const matches =
    Element.prototype.matches ||
    Element.prototype["msMatchesSelector"] ||
    Element.prototype["webkitMatchesSelector"];
  return matches.apply(parent, [selector]);
}

type DelegateEvent = Event & { delegateTarget: HTMLElement };
type DelegateEventListener = (evt: DelegateEvent) => void;

function toggleClass(parent: Element, selector: string, className: string, on: boolean) {
  parent.querySelectorAll(selector).forEach(n => {
    if (on && !n.classList.contains(className) ) {
      n.classList.add(className);
    } else if (!on && n.classList.contains(className)) {
      n.classList.remove(className);
    }
  });
}

function mergeOptions<TLeft, TRight>(left:TLeft, right: TRight): TLeft & TRight {
    return mergeWith({}, left, right, (objVal, srcVal) => {
        if (Array.isArray(objVal)) {
            return objVal.concat(srcVal);
        }
    })
}

export interface ClndrOptions {

  locale: string;
  // The template: this could be stored in markup as a
  //   <script type="text/template"></script>
  // or pulled in as a string
  template: string;

  // Determines which month to start with using either a date string or a
  // moment object.
  startWithMonth?: string | luxon.DateTime;

  // The target classnames that CLNDR will look for to bind events.
  // these are the defaults.
  targets: {
    day: string;
    today: string;
    empty: string;
    nextButton: string;
    todayButton: string;
    previousButton: string;
    nextYearButton: string;
    previousYearButton: string;
  };

  // Custom classes to avoid styling issues. pass in only the classnames that
  // you wish to override. These are the defaults.
  classes: {
    past: string;
    today: string;
    event: string;
    inactive: string;
    selected: string;
    lastMonth: string;
    nextMonth: string;
    adjacentMonth: string;
  };

  // Click callbacks! The keyword 'this' is set to the clndr instance in all
  // callbacks.
  clickEvents: Partial<ClickEvents>;

  // Use the 'touchstart' event instead of 'click'
  useTouchEvents: boolean;

  // This is called only once after clndr has been initialized and rendered.
  // use this to bind custom event handlers that don't need to be re-attached
  // every time the month changes (most event handlers fall in this category).
  // Hint: this.element refers to the parent element that holds the clndr,
  // and is a great place to attach handlers that don't get tossed out every
  // time the clndr is re-rendered.
  ready?: (this: Clndr) => void;

  // A callback when the calendar is done rendering. This is a good place
  // to bind custom event handlers (also see the 'ready' option above).
  doneRendering?: (this: Clndr) => void;

  events: ClndrEvent[];

  // If you're supplying an events array, dateParameter points to the field
  // in your event object containing a date string. It's set to 'date' by
  // default.
  dateParameter: string;
  multiDayEvents?: {
    endDate: string;
    startDate: string;
    // If you also have single day events with a different date field,
    // use the singleDay property and point it to the date field.
    singleDay: string;
  };

  // Show the dates of days in months adjacent to the current month. Defaults
  // to true.
  showAdjacentMonths: boolean;

  // When days from adjacent months are clicked, switch the current month.
  // fires nextMonth/previousMonth/onMonthChange click callbacks. defaults to
  // false.
  adjacentDaysChangeMonth: boolean;

  // Always make the calendar six rows tall (42 days) so that every month has
  // a consistent height. defaults to 'false'.
  forceSixRows: boolean;

  // Set this to true, if you want the plugin to track the last clicked day.
  // If trackSelectedDate is true, "selected" class will always be applied
  // only to the most recently clicked date; otherwise - selectedDate will
  // not change.
  trackSelectedDate: boolean;

  // Set this, if you want a date to be "selected" (see classes.selected)
  // after plugin init. Defualts to null, no initially selected date.
  selectedDate?: string | luxon.DateTime;

  // Set this to true if you don't want `inactive` dates to be selectable.
  // This will only matter if you are using the `constraints` option.
  ignoreInactiveDaysInSelection: boolean;

  // CLNDR can render in any time interval!
  // You can specify if you want to render one or more months, or one ore more
  // days in the calendar, as well as the paging interval whenever forward or
  // back is triggered. If both months and days are null, CLNDR will default
  // to the standard monthly view.
  lengthOfTime: {
    // The date in which to start the current interval
    startDate?: string | luxon.DateTime;
    // Set to an integer if you want to render one or more months, otherwise
    // leave this null
    months?: number;

    // Set to an integer if you want to render one or more days, otherwise
    // leave this null. Setting this to 14 would render a 2-week calendar.
    days?: number;

    // This is the amount of months or days that will move forward/back when
    // paging the calendar. With days=14 and interval=7, you would have a
    // 2-week calendar that pages forward and backward 1 week at a time.
    interval?: number;
  };

  // The week offset to be applied to the calender.
  // This is added to the the default start of ISO weeks (0)
  weekOffset: number;

  // Any other data variables you want access to in your template. This gets
  // passed into the template function.
  extras?: unknown;

  // If you want to use a different templating language, here's your ticket.
  // Precompile your template (before you call clndr), pass the data from the
  // render function into your template, and return the result. The result
  // must be a string containing valid markup. The keyword 'this' is set to
  // the clndr instance in case you need access to any other properties.
  render?: (data: RenderData) => string;

  // If you want to prevent the user from navigating the calendar outside
  // of a certain date range (e.g. if you are making a datepicker), specify
  // either the startDate, endDate, or both in the constraints option. You
  // can change these while the calendar is on the page... See documentation
  // below for more on this!
  constraints?: {
    startDate?: string | luxon.DateTime;
    endDate?: string | luxon.DateTime;
  };
}

export interface ClndrEvent {
  title: string;
  [key: string]: string | luxon.DateTime;
}

export interface ClndrEventTarget {
  date?: luxon.DateTime;
  events: ClndrEvent[];
  element: Element;
}

export interface ClickEvents {
  click: (target: ClndrEventTarget) => void;
  today: (dateTime: luxon.DateTime) => void;
  onMonthChange: (dateTime: luxon.DateTime) => void;
  previousMonth: (dateTime: luxon.DateTime) => void;
  nextMonth: (dateTime: luxon.DateTime) => void;
  onYearChange: (dateTime: luxon.DateTime) => void;
  previousYear: (dateTime: luxon.DateTime) => void;
  nextYear: (dateTime: luxon.DateTime) => void;
  previousInterval: (start: luxon.DateTime, end: luxon.DateTime) => void;
  nextInterval: (start: luxon.DateTime, end: luxon.DateTime) => void;
  onIntervalChange: (start: luxon.DateTime, end: luxon.DateTime) => void;
}

export interface RenderData {
  // An array of day-of-the-week abbreviations, shifted as requested using the
  // weekOffset parameter.
  daysOfTheWeek: string[];

  // The number of 7-block calendar rows, in the event that you want to do some
  // looping with it
  numberOfRows: number;

  // The days array, documented in more detail above
  days: Day[];

  // The month name: don't forget that you can do things like
  // month.substring(0, 1) and month.toLowerCase() in your template
  month: string;

  months: { days: Day[], month: luxon.DateTime }[];

  // The year that the calendar is currently focused on
  year: string;

  // All of the events happening this month. This will be empty of the
  // lengthOfTime config option is set.
  eventsThisMonth?: unknown[];

  // All of the events happening last month. This is only set if
  // showAdjacementMonths is true.
  eventsLastMonth?: unknown[];

  // All of the events happening next month. This is only set if
  // showAdjacementMonths is true.
  eventsNextMonth?: unknown[];

  // If you specified a custom lengthOfTime, you will have these instead.
  intervalStart?: luxon.DateTime;
  intervalEnd?: luxon.DateTime;
  eventsThisInterval?: unknown[];
  extras?: unknown;
}

interface InternalEvent extends ClndrEvent {
  _clndrStartDateObject: luxon.DateTime;
  _clndrEndDateObject: luxon.DateTime;
}

interface Day {
  day: number;
  classes: string;
  id: string;
  events: ClndrEvent[];
  date: luxon.DateTime;
  properties?: {
    isInactive?: boolean;
    isToday?: boolean;
    isAdjacentMonth?: boolean;
  }
}

interface ActionOptions {
    withCallbacks?: boolean;
}

// Defaults used throughout the application, see docs.
const defaults: ClndrOptions = {
  locale: null,
  events: [],
  ready: null,
  extras: null,
  render: null,
  constraints: null,
  forceSixRows: null,
  selectedDate: null,
  doneRendering: null,
  multiDayEvents: null,
  startWithMonth: null,
  dateParameter: "date",
  template: defaultClndrTemplate,
  showAdjacentMonths: true,
  trackSelectedDate: false,
  useTouchEvents: false,
  adjacentDaysChangeMonth: false,
  ignoreInactiveDaysInSelection: null,
  lengthOfTime: {
    days: null,
    interval: 1,
    months: null
  },
  weekOffset: 0,
  clickEvents: {
    click: null,
    today: null,
    nextYear: null,
    nextMonth: null,
    nextInterval: null,
    previousYear: null,
    onYearChange: null,
    previousMonth: null,
    onMonthChange: null,
    previousInterval: null,
    onIntervalChange: null
  },
  targets: {
    day: "day",
    empty: "empty",
    today: "today",
    nextButton: "clndr-next-button",
    todayButton: "clndr-today-button",
    previousButton: "clndr-previous-button",
    nextYearButton: "clndr-next-year-button",
    previousYearButton: "clndr-previous-year-button"
  },
  classes: {
    past: "past",
    today: "today",
    event: "event",
    inactive: "inactive",
    selected: "selected",
    lastMonth: "last-month",
    nextMonth: "next-month",
    adjacentMonth: "adjacent-month"
  }
};

export default class Clndr {
  public element: HTMLElement;

  private _options: ClndrOptions & { events: InternalEvent[] };
  public get options() {
      return {...this._options};
  }

  private intervalStart: luxon.DateTime;
  private intervalEnd: luxon.DateTime;
  private month: luxon.DateTime;
  private compiledClndrTemplate: ReturnType<typeof template>;
  private calendarContainer: HTMLElement;
  private daysOfTheWeek: [string,string,string,string,string,string,string];

  private constraints = {
    next: true,
    today: true,
    previous: true,
    nextYear: true,
    previousYear: true
  };
  
  private static nodeMap = new WeakMap<Node, Clndr>();

  constructor(element: HTMLElement, options: Partial<ClndrOptions> & { template }) {
      if (Clndr.nodeMap.has(element)) {
          throw new Error("There's already a Clndr associated with this node.");
      }
      Clndr.nodeMap.set(element, this);
    this.element = element;
    this._options = mergeOptions(defaults, options) as ClndrOptions & { events: InternalEvent[] };

    if (this._options.events.length) {
      if (this._options.multiDayEvents) {
        this._options.events = this.addMultiDayMomentObjectsToEvents(
          options.events
        );
      } else {
        this._options.events = this.addMomentObjectToEvents(options.events);
      }
    }

    // This used to be a place where we'd figure out the current month,
    // but since we want to open up support for arbitrary lengths of time
    // we're going to store the current range in addition to the current
    // month.
    if (this._options.lengthOfTime.months || this._options.lengthOfTime.days) {
      // We want to establish intervalStart and intervalEnd, which will
      // keep track of our boundaries. Let's look at the possibilities...
      if (this._options.lengthOfTime.months) {
        // Gonna go right ahead and annihilate any chance for bugs here
        this._options.lengthOfTime.days = null;

        // The length is specified in months. Is there a start date?
        if (this._options.lengthOfTime.startDate) {
          this.intervalStart = this._parse(
            this._options.lengthOfTime.startDate
          ).startOf("month");
        } else if (this._options.startWithMonth) {
          this.intervalStart = this._parse(this._options.startWithMonth).startOf(
            "month"
          );
        } else {
          this.intervalStart = DateTime.local().startOf("month");
        }

        // Subtract a day so that we are at the end of the interval. We
        // always want intervalEnd to be inclusive.
        this.intervalEnd = this.intervalStart
          .plus({ months: options.lengthOfTime.months })
          .minus({ months: 1 })
          .endOf("month");
        this.month = this.intervalStart;
      } else if (this._options.lengthOfTime.days) {
        // The length is specified in days. Start date?
        if (this._options.lengthOfTime.startDate) {
          this.intervalStart = this._parse(
                this._options.lengthOfTime.startDate
              ).startOf("day");
        } else {
          this.intervalStart = DateTime.local()
            .startOf("week")
            .plus({ days: this._options.weekOffset - 1 })
            .startOf("day");
        }

        this.intervalEnd = this._parse(this.intervalStart)
          .plus({ days: this._options.lengthOfTime.days - 1 })
          .endOf("day");
        this.month = this.intervalStart;
      }
      // No length of time specified so we're going to default into using the
      // current month as the time period.
    } else {
      this.month = DateTime.local().startOf("month");
      this.intervalStart = this.month;
      this.intervalEnd = this.month.endOf("month");
    }

    if (this._options.startWithMonth) {
      this.month = this._parse(this._options.startWithMonth).startOf("month");
      this.intervalStart = this.month;
      this.intervalEnd = this._options.lengthOfTime.days
        ? this.month
            .plus({ days: this._options.lengthOfTime.days - 1 })
            .endOf("day")
        : this.month.endOf("month");
    }

    let constraintStart: luxon.DateTime;
    let constraintEnd: luxon.DateTime;

    // If we've got constraints set, make sure the interval is within them.
    if (this._options.constraints) {
      // First check if the startDate exists & is later than now.
      if (this._options.constraints.startDate) {
        constraintStart = this._parse(this._options.constraints.startDate);

        // We need to handle the constraints differently for weekly
        // calendars vs. monthly calendars.
        if (this._options.lengthOfTime.days) {
          if (this.isBefore(this.intervalStart, constraintStart, "week")) {
            this.intervalStart = constraintStart.startOf("week").plus({ days: this._options.weekOffset - 1 });
          }

          // If the new interval period is less than the desired length
          // of time, or before the starting interval, then correct it.
          const dayDiff = this.intervalStart
            .diff(this.intervalEnd, "days")
            .toObject()["days"];

          if (
            dayDiff < this._options.lengthOfTime.days ||
            this.intervalEnd < this.intervalStart
          ) {
            this.intervalEnd = this._parse(this.intervalStart)
              .plus({ days: this._options.lengthOfTime.days - 1 })
              .endOf("day");
            this.month = this.intervalStart;
          }
        } else {
          if (this.isBefore(this.intervalStart, constraintStart, "month")) {
            // Try to preserve the date by moving only the month.
            this.intervalStart = this.intervalStart
              .set({ month: constraintStart.month })
              .set({ year: constraintStart.year });
            this.month = this.month
              .set({ month: constraintStart.month })
              .set({ year: constraintStart.year });
          }

          // Check if the ending interval is earlier than now.
          if (this.isBefore(this.intervalEnd, constraintStart, "month")) {
            this.intervalEnd = this.intervalEnd
              .set({ month: constraintStart.month })
              .set({ year: constraintStart.year });
          }
        }
      }

      // Make sure the intervalEnd is before the endDate.
      if (this._options.constraints.endDate) {
        constraintEnd = this._parse(this._options.constraints.endDate);

        // We need to handle the constraints differently for weekly
        // calendars vs. monthly calendars.
        if (this._options.lengthOfTime.days) {
          // The starting interval is after our ending constraint.
          if (this.isAfter(this.intervalStart, constraintEnd, "week")) {
            this.intervalStart = constraintEnd
              .endOf("week")
              .minus({ days: this._options.lengthOfTime.days - 1 })
              .startOf("day");
            this.intervalEnd = constraintEnd.endOf("week");
            this.month = this.intervalStart;
          }
        } else {
          if (this.isAfter(this.intervalEnd, constraintEnd, "month")) {
            // Try to preserve the date by moving only the month.
            this.intervalEnd = this.intervalEnd
              .set({ month: constraintEnd.month })
              .set({ year: constraintEnd.year });
            this.month = this.month
              .set({ month: constraintEnd.month })
              .set({ year: constraintEnd.year });
          }

          // Check if the ending interval is earlier than now.
          if (this.isAfter(this.intervalStart, constraintEnd, "month")) {
            this.intervalStart = this.intervalStart
              .set({ month: constraintEnd.month })
              .set({ year: constraintEnd.year });
          }
        }
      }
    }

    this.init();
  }

  /**
   * Calendar initialization.
   * Sets up the days of the week, the rendering function, binds all of the
   * events to the rendered calendar, and then stores the node locally.
   */
  private init() {
    this.daysOfTheWeek = Info.weekdays('narrow', { locale: this._options.locale }) as any;

    let offset = (this.options.weekOffset || 0) - 1;
    while (offset > 0) {
      this.daysOfTheWeek.push(this.daysOfTheWeek.shift()) as any;
      offset--;
    }
    while (offset < 0) {
      this.daysOfTheWeek.unshift(this.daysOfTheWeek.pop()) as any;
      offset++;
    }

    // Quick and dirty test to make sure rendering is possible.
    if (typeof this._options.render !== 'function') {
      this._options.render = null;
      this.compiledClndrTemplate = template(this._options.template);
    }

    // Create the parent element that will hold the plugin and save it
    // for later
    this.element.innerHTML = "<div class='clndr'></div>";
    this.calendarContainer = this.element.querySelector(".clndr");

    // Attach event handlers for clicks on buttons/cells
    this.bindEvents();

    // Do a normal render of the calendar template
    this.render();

    // If a ready callback has been provided, call it.
    if (this._options.ready) {
      this._options.ready.apply(this, []);
    }
  }

  private boundContainerEvents: [string, EventListener][] = [];

  private addContainerEvent(
    event: string,
    handler: DelegateEventListener,
    selector: string
  ) {
    function filterEvent(e: DelegateEvent, selector: string, handler: EventListener) {
      let targetElem = closet(e.target as Element, selector) as HTMLElement | null;
      if (targetElem) {
        e.delegateTarget = targetElem;
        handler(e);
      }
    }
    const listener = (e: DelegateEvent) => filterEvent(e, selector, handler);
    this.element.addEventListener(event, listener, false);
    this.boundContainerEvents.push([event, listener]);
  }

  private clearContainerEvents() {
    while (this.boundContainerEvents.length > 0) {
      const ev = this.boundContainerEvents.pop();
      this.element.removeEventListener(ev[0], ev[1]);
    }
  }

  private _currentIntervalStart: luxon.DateTime | null;
  private eventsLastMonth: InternalEvent[] = [];
  private eventsNextMonth: InternalEvent[] = [];
  private eventsThisInterval: InternalEvent[] = [];

  /**
   * This is where the magic happens. Given a starting date and ending date,
   * an array of calendarDay objects is constructed that contains appropriate
   * events and classes depending on the circumstance.
   */
  private createDaysObject(startDate: luxon.DateTime, endDate: luxon.DateTime) {
      // This array will hold numbers for the entire grid (even the blank
      // spaces).
      const daysArray = [],
          date = startDate;
    
      const events = (this._options.events || []) as InternalEvent[];

      // This is a helper object so that days can resolve their classes
      // correctly. Don't use it for anything please.
      this._currentIntervalStart = startDate;

      // Filter the events list (if it exists) to events that are happening
      // last month, this month and next month (within the current grid view).
      this.eventsLastMonth = [];
      this.eventsNextMonth = [];
      this.eventsThisInterval = [];

      // Event parsing
      if (this._options.events.length) {
          // Here are the only two cases where we don't get an event in our
          // interval:
          //   startDate | endDate | e.start   | e.end
          //   e.start   | e.end   | startDate | endDate
          this.eventsThisInterval = events.filter(
               (event: InternalEvent) => {
                  var afterEnd = event._clndrStartDateObject > endDate,
                      beforeStart = event._clndrEndDateObject < startDate; 

                  if (beforeStart || afterEnd) {
                      return false;
                  } else {
                      return true;
                  }
              });

          if (this._options.showAdjacentMonths) {
              let startOfLastMonth = startDate
                  .minus({months: 1})
                  .startOf('month');
              let endOfLastMonth = startOfLastMonth.endOf('month');
              let startOfNextMonth = endDate
                  .plus({ months: 1 })
                  .startOf('month');
              let endOfNextMonth = startOfNextMonth.endOf('month');
              
                this.eventsLastMonth = events.filter(
                    (event: InternalEvent) => {
                    var afterEnd = event._clndrStartDateObject > endOfLastMonth,
                        beforeStart = event._clndrEndDateObject < startOfLastMonth; 

                    if (beforeStart || afterEnd) {
                        return false;
                    } else {
                        return true;
                    }
                });
              
                this.eventsNextMonth = events.filter(
                    (event: InternalEvent) => {
                    var afterEnd = event._clndrStartDateObject > endOfNextMonth,
                        beforeStart = event._clndrEndDateObject < startOfNextMonth; 

                    if (beforeStart || afterEnd) {
                        return false;
                    } else {
                        return true;
                    }
                });
          }
      }

      // If diff is greater than 0, we'll have to fill in last days of the
      // previous month to account for the empty boxes in the grid. We also
      // need to take into account the weekOffset parameter. None of this
      // needs to happen if the interval is being specified in days rather
      // than months.
      if (!this._options.lengthOfTime.days) {
          let diff = date.weekday - this._options.weekOffset;

          if (diff < 0) {
            diff += 7;
          }

          if (this._options.showAdjacentMonths) {
              for (var i = 1; i <= diff; i++) {
                  const day = DateTime.fromObject({
                      year: startDate.year,
                      month: startDate.month,
                      day: i
                  }).minus({ days: diff });
                  console.log("diff", day.toISO(), day.weekday);
                  daysArray.push(
                      this.createDayObject(
                          day,
                          this.eventsLastMonth
                      ));
              }
          } else {
              for (var i = 0; i < diff; i++) {
                  daysArray.push(
                      this.calendarDay({
                          classList: [this._options.targets.empty, this._options.classes.lastMonth]
                      }));
              }
          }
      }

      // Now we push all of the days in the interval
      let dateIterator = startDate;

      while (dateIterator < endDate || dateIterator.hasSame(endDate, 'day')) {
          daysArray.push(
              this.createDayObject(
                  dateIterator,
                  this.eventsThisInterval
              ));
          dateIterator = dateIterator.plus({ days: 1 });
      }

      // ...and if there are any trailing blank boxes, fill those in with the
      // next month first days. Again, we can ignore this if the interval is
      // specified in days.
      if (!this._options.lengthOfTime.days) {
          while (daysArray.length % 7 !== 0) {
              if (this._options.showAdjacentMonths) {
                  daysArray.push(
                      this.createDayObject(
                          dateIterator,
                          this.eventsNextMonth
                      ));
              } else {
                  daysArray.push(
                      this.calendarDay({
                        classList: [this._options.targets.empty,
                              this._options.classes.nextMonth ]
                      }));
              }
              dateIterator = dateIterator.plus({ days: 1 });
          }
      }

      // If we want to force six rows of calendar, now's our Last Chance to
      // add another row. If the 42 seems explicit it's because we're
      // creating a 7-row grid and 6 rows of 7 is always 42!
      if (this._options.forceSixRows && daysArray.length !== 42) {
          while (daysArray.length < 42) {
              if (this._options.showAdjacentMonths) {
                  daysArray.push(
                      this.createDayObject(
                          dateIterator,
                          this.eventsNextMonth
                      ));
                    dateIterator = dateIterator.plus({ days: 1 });
              } else {
                  daysArray.push(
                      this.calendarDay({
                        classList: [this._options.targets.empty,
                            this._options.classes.nextMonth ]
                  }));
              }
          }
      }

      return daysArray;
  };

  private createDayObject(day: luxon.DateTime, monthEvents: InternalEvent[]) {
      var now = DateTime.local(),
          eventsToday: InternalEvent[] = [],
          properties = {
              isToday: false,
              isInactive: false,
              isAdjacentMonth: false
          };
      const extraClasses: string[] = [];

      for (const event of monthEvents) {
          // Keep in mind that the events here already passed the month/year
          // test. Now all we have to compare is the moment.date(), which
          // returns the day of the month.
          var start = event._clndrStartDateObject,
              end = event._clndrEndDateObject;
          // If today is the same day as start or is after the start, and
          // if today is the same day as the end or before the end ...
          // woohoo semantics!
          if ( (day.hasSame(start, 'day') || this.isAfter(day, start, 'day'))
              && (day.hasSame(end, 'day') || this.isBefore(day, end, 'day')) )
          {
              eventsToday.push(event);
          }

      }

      if (now.toFormat("yyyy-MM-dd") == day.toFormat("yyyy-MM-dd")) {
          extraClasses.push(this._options.classes.today);
          properties.isToday = true;
      }

      if (this.isBefore(day, now, 'day')) {
          extraClasses.push(this._options.classes.past);
      }

      if (eventsToday.length > 0) {
          extraClasses.push(this._options.classes.event);
      }

      if (!this._options.lengthOfTime.days) {
          if (this._currentIntervalStart.month > day.month) {
              extraClasses.push(this._options.classes.adjacentMonth);
              properties.isAdjacentMonth = true;

              this._currentIntervalStart.year === day.year
                  ? extraClasses.push(this._options.classes.lastMonth)
                  : extraClasses.push(this._options.classes.nextMonth);
          }
          else if (this._currentIntervalStart.month < day.month) {
              extraClasses.push(this._options.classes.adjacentMonth);
              properties.isAdjacentMonth = true;

              this._currentIntervalStart.year === day.year
                  ? extraClasses.push(this._options.classes.nextMonth)
                  : extraClasses.push(this._options.classes.lastMonth);
          }
      }

      // If there are constraints, we need to add the inactive class to the
      // days outside of them
      if (this._options.constraints) {
          let startMoment = this._parse(this._options.constraints.startDate);
          let endMoment = this._parse(this._options.constraints.endDate);

          if (startMoment && day < startMoment) {
              extraClasses.push(this._options.classes.inactive);
              properties.isInactive = true;
          }

          if (endMoment && day > endMoment) {
              extraClasses.push(this._options.classes.inactive);
              properties.isInactive = true;
          }
      }

      // Check whether the day is "selected"
      let selectedMoment = this._parse(this._options.selectedDate);

      if (this._options.selectedDate && day.hasSame(selectedMoment, 'day')) {
          extraClasses.push(this._options.classes.selected);
      }

      // We can't easily attached data to the rendered dom, so we use classes to signify
      // the day and day of week.
      extraClasses.push("calendar-day-" + day.toISODate());
      extraClasses.push("calendar-dow-" + day.weekday);

      return this.calendarDay({
          date: day,
          day: day.day,
          events: eventsToday,
          properties: properties,
          classList: [this._options.targets.day, ...extraClasses]
      });
  };

  private render() {
      // Get rid of the previous set of calendar parts. This should handle garbage
      // collection according to jQuery's docs:
      //   http://api.jquery.com/empty/
      //   To avoid memory leaks, jQuery removes other constructs such as
      //   data and event handlers from the child elements before removing
      //   the elements themselves.
      let data: Partial<RenderData> = {},
          oneYearFromEnd = this.intervalEnd.plus({ years: 1 }),
          oneYearAgo = this.intervalStart.minus({ years: 1 });

        this.calendarContainer.innerHTML = "";

      if (this._options.lengthOfTime.days) {
          const days = this.createDaysObject(
              this.intervalStart,
              this.intervalEnd);
          data = {
              days: days,
              months: [],
              year: null,
              month: null,
              eventsLastMonth: [],
              eventsNextMonth: [],
              eventsThisMonth: [],
              extras: this._options.extras,
              intervalEnd: this.intervalEnd,
              daysOfTheWeek: this.daysOfTheWeek,
              numberOfRows: Math.ceil(days.length / 7),
              intervalStart: this.intervalStart,
              eventsThisInterval: this.eventsThisInterval
          };
      }
      else if (this._options.lengthOfTime.months) {
          const months: { days: Day[]; month: luxon.DateTime }[] = [];
          let numberOfRows = 0;
          const eventsThisInterval: InternalEvent[] = [];

          for (let i = 0; i < this._options.lengthOfTime.months; i++) {
              var currentIntervalStart = this.intervalStart
                  .plus({months: i});
              var currentIntervalEnd = currentIntervalStart
                  .endOf('month');
              const days = this.createDaysObject(
                  currentIntervalStart,
                  currentIntervalEnd);
              // Save events processed for each month into a master array of
              // events for this interval
              eventsThisInterval.push(...this.eventsThisInterval);
              months.push({
                  days: days,
                  month: currentIntervalStart
              });
          }

          // Get the total number of rows across all months
          for (const month of months) {
              numberOfRows += Math.ceil(month.days.length / 7);
          }

          data = {
              days: [],
              year: null,
              month: null,
              months: months,
              eventsThisMonth: [],
              numberOfRows: numberOfRows,
              extras: this._options.extras,
              intervalEnd: this.intervalEnd,
              intervalStart: this.intervalStart,
              daysOfTheWeek: this.daysOfTheWeek,
              eventsLastMonth: this.eventsLastMonth,
              eventsNextMonth: this.eventsNextMonth,
              eventsThisInterval: eventsThisInterval,
          };
      }
      else {
          // Get an array of days and blank spaces
          const days = this.createDaysObject(
              this.month.startOf('month'),
              this.month.endOf('month'));

          data = {
              days: days,
              months: [],
              intervalEnd: null,
              intervalStart: null,
              year: this.month.year + "",
              eventsThisInterval: null,
              extras: this._options.extras,
              month: this.month.toFormat('MMMM'),
              daysOfTheWeek: this.daysOfTheWeek,
              eventsLastMonth: this.eventsLastMonth,
              eventsNextMonth: this.eventsNextMonth,
              numberOfRows: Math.ceil(days.length / 7),
              eventsThisMonth: this.eventsThisInterval
          };
      }

      // Render the calendar with the data above & bind events to its
      // elements
      if ( !this._options.render) {
          this.calendarContainer.innerHTML =
              this.compiledClndrTemplate(data);
      } else {
          this.calendarContainer.innerHTML =
              this._options.render.apply(this, [data]);
      }

      // If there are constraints, we need to add the 'inactive' class to
      // the controls.
      if (this._options.constraints) {
          // In the interest of clarity we're just going to remove all
          // inactive classes and re-apply them each render.
          for (var target in this._options.targets) {
              if (target != this._options.targets.day) {
                toggleClass(this.element, '.' + this._options.targets[target], this._options.classes.inactive, false);
              }
          }

          let start: luxon.DateTime | null;
          let end: luxon.DateTime | null;

          // Just like the classes we'll set this internal state to true and
          // handle the disabling below.
          for (var i in this.constraints) {
              this.constraints[i] = true;
          }

          if (this._options.constraints.startDate) {
              start = this._parse(this._options.constraints.startDate);
          }

          if (this._options.constraints.endDate) {
              end = this._parse(this._options.constraints.endDate);
          }

          // Deal with the month controls first. Do we have room to go back?
          if (start
              && (start > this.intervalStart
                  || start.hasSame(this.intervalStart, 'day')))
          {
              toggleClass(this.element, '.' + this._options.targets.previousButton, this._options.classes.inactive, true)
              this.constraints.previous = !this.constraints.previous;
          }

          // Do we have room to go forward?
          if (end
              && (end < this.intervalEnd
                  || end.hasSame(this.intervalEnd, 'day')))
          {
              toggleClass(this.element, '.' + this._options.targets.nextButton, this._options.classes.inactive, true)
              this.constraints.next = !this.constraints.next;
          }

          // What's last year looking like?
          if (start && start > oneYearAgo) {
              toggleClass(this.element, '.' + this._options.targets.previousYearButton, this._options.classes.inactive, true)
              this.constraints.previousYear = !this.constraints.previousYear;
          }

          // How about next year?
          if (end && end < oneYearFromEnd) {
              toggleClass(this.element, '.' + this._options.targets.nextYearButton, this._options.classes.inactive, true)
              this.constraints.nextYear = !this.constraints.nextYear;
          }

          // Today? We could put this in init(), but we want to support the
          // user changing the constraints on a living instance.
          if ( (start && this.isAfter(start, DateTime.local(), 'month' ))
              || (end && this.isBefore(end, DateTime.local(), 'month' )) )
          {
              toggleClass(this.element, '.' + this._options.targets.today, this._options.classes.inactive, true)
              this.constraints.today = !this.constraints.today;
          }
      }

      if (this._options.doneRendering) {
          this._options.doneRendering.apply(this, []);
      }
  };

  private bindEvents() {
    const targets = this._options.targets,
      classes = this._options.classes,
      eventName = this._options.useTouchEvents === true ? "touchstart" : "click";

    // Make sure we don't already have events
    this.clearContainerEvents();

    // Target the day elements and give them click events
    this.addContainerEvent(
      eventName,
      event => {
        let target: ClndrEventTarget;
        let eventTarget = event.delegateTarget as HTMLElement;

        if (this._options.clickEvents.click) {
          target = this.buildTargetObject(eventTarget, true);
          this._options.clickEvents.click.apply(this, [target]);
        }

        // If adjacentDaysChangeMonth is on, we need to change the
        // month here.
        if (this._options.adjacentDaysChangeMonth) {
          if (matches(eventTarget, "." + classes.lastMonth)) {
            this.backAction();
          } else if (matches(eventTarget, "." + classes.nextMonth)) {
            this.forwardAction();
          }
        }

        // if trackSelectedDate is on, we need to handle click on a new day
        if (this._options.trackSelectedDate) {
          if (
            this._options.ignoreInactiveDaysInSelection &&
            eventTarget.classList.contains(classes.inactive)
          ) {
            return;
          }

          // Remember new selected date
          this._options.selectedDate = this.getTargetDateString(eventTarget);
          // Handle "selected" class. This handles more complex templates
          // that may have the selected elements nested.
          toggleClass(this.element, "." + classes.selected, classes.selected, false);
          eventTarget.classList.add(classes.selected);
        }
      },
      "." + targets.day
    );

    // Target the empty calendar boxes as well
    this.addContainerEvent(
      eventName,
      event => {
        let target: ClndrEventTarget;
        let eventTarget = event.delegateTarget;

        if (this._options.clickEvents.click) {
          target = this.buildTargetObject(eventTarget, false);
          this._options.clickEvents.click.apply(this, [target]);
        }

        if (this._options.adjacentDaysChangeMonth) {
          if (matches(eventTarget, "." + classes.lastMonth)) {
            this.backAction();
          } else if (matches(eventTarget, "." + classes.nextMonth)) {
            this.forwardAction();
          }
        }
      },
      "." + targets.empty
    );

    this.addContainerEvent(eventName, this.todayAction, "." + targets.todayButton);
    this.addContainerEvent(eventName, this.forwardAction, "." + targets.nextButton);
    this.addContainerEvent(eventName, this.backAction, "." + targets.previousButton);
    this.addContainerEvent(eventName, this.nextYearAction, "." + targets.nextYearButton);
    this.addContainerEvent(eventName, this.previousYearAction, "." + targets.previousYearButton);
  }


     /**
     * Main action to go backward one period. Other methods call these, like
     * backAction which proxies jQuery events, and backActionWithContext which
     * is an internal method that this library uses.
     */
    public back = (options: ActionOptions = {}) => {
        let timeOpt = this._options.lengthOfTime,
            defaults = {
                withCallbacks: false
            },
            orig = {
                end: this.intervalEnd,
                start: this.intervalStart
            };

        // Extend any options
        options = mergeOptions(defaults, options);

        // Before we do anything, check if any constraints are limiting this
        if (!this.constraints.previous) {
            return this;
        }

        if (!timeOpt.days) {
            // Shift the interval by a month (or several months)
            this.intervalStart =
                this.intervalStart
                    .minus({ months: timeOpt.interval })
                    .startOf('month');
            this.intervalEnd = this.intervalStart
                .plus({ months: timeOpt.months || timeOpt.interval })
                .minus({days: 1})
                .endOf('month');
            this.month = this.intervalStart;
        }
        else {
            // Shift the interval in days
            this.intervalStart =
                this.intervalStart
                    .minus({days: timeOpt.interval})
                    .startOf('day');
            this.intervalEnd = this.intervalStart
                .plus({days: timeOpt.days - 1})
                .endOf('day');
            // @V2-todo Useless, but consistent with API
            this.month = this.intervalStart;
        }

        this.render();

        if (options.withCallbacks) {
            this.triggerEvents(orig);
        }

        return this;
    };

    private backAction = () => {
        this.back({
            withCallbacks: true
        });
    };

    public previous = (options: ActionOptions = {}) => {
        // Alias
        return this.back(options);
    };

    /**
     * Main action to go forward one period. Other methods call these, like
     * forwardAction which proxies jQuery events, and backActionWithContext
     * which is an internal method that this library uses.
     */
    public forward = (options: ActionOptions = {}) => {
        let timeOpt = this._options.lengthOfTime,
            defaults = {
                withCallbacks: false
            },
            orig = {
                end: this.intervalEnd,
                start: this.intervalStart
            };

        // Extend any options
        options = mergeOptions(defaults, options);

        // Before we do anything, check if any constraints are limiting this
        if (!this.constraints.next) {
            return this;
        }

        if (!timeOpt.days) {
            // Shift the interval by a month (or several months)
            this.intervalStart =
                this.intervalStart
                .plus({ months: timeOpt.interval })
                .startOf('month');
            this.intervalEnd = this.intervalStart
                .plus({ months: timeOpt.months || timeOpt.interval })
                .minus({days: 1})
                .endOf('month');
            this.month = this.intervalStart;
        }
        else {
            // Shift the interval in days
            this.intervalStart = 
                this.intervalStart
                .plus({days: timeOpt.interval})
                .startOf('day');
            this.intervalEnd = this.intervalStart
                .plus({days: timeOpt.days - 1})
                .endOf('day');
            // @V2-todo Useless, but consistent with API
            this.month = this.intervalStart;
        }

        this.render();

        if (options.withCallbacks) {
            this.triggerEvents(orig);
        }

        return this;
    };

    private forwardAction = () => {
        this.forward({
            withCallbacks: true
        });
    };

    public next(options: ActionOptions = {}) {
        // Alias
        return this.forward(options);
    };

    /**
     * Main action to go back one year.
     */
    private previousYear = (options: ActionOptions = {}) => {
        let defaults = {
                withCallbacks: false
            },
            orig = {
                end: this.intervalEnd,
                start: this.intervalStart
            };

        // Extend any options
        options = mergeOptions(defaults, options);

        // Before we do anything, check if any constraints are limiting this
        if (!this.constraints.previousYear) {
            return this;
        }

        this.month = this.month.minus({year: 1});
        this.intervalStart = this.intervalStart.minus({year: 1});
        this.intervalEnd = this.intervalEnd.minus({year: 1});
        this.render();

        if (options.withCallbacks) {
            this.triggerEvents(orig);
        }

        return this;
    };

    private previousYearAction = () => {
        this.previousYear({
            withCallbacks: true
        });
    };

    /**
     * Main action to go forward one year.
     */
    public nextYear = (options: ActionOptions = {}) => {
        let defaults = {
                withCallbacks: false
            },
            orig = {
                end: this.intervalEnd,
                start: this.intervalStart
            };

        // Extend any options
        options = mergeOptions(defaults, options);

        // Before we do anything, check if any constraints are limiting this
        if (!this.constraints.nextYear) {
            return this;
        }

        this.month = this.month.plus({year: 1});
        this.intervalStart = this.intervalStart.plus({year: 1});
        this.intervalEnd = this.intervalEnd.plus({year: 1});
        this.render();

        if (options.withCallbacks) {
            this.triggerEvents(orig);
        }

        return this;
    };

    private nextYearAction = () => {
        this.nextYear({
            withCallbacks: true
        });
    };

  private today = (
    options: ActionOptions
  ) => {
    let timeOpt = this._options.lengthOfTime,
      defaults = {
        withCallbacks: false
      },
      orig = {
        end: this.intervalEnd,
        start: this.intervalStart
      };

    // Extend any options
    options = mergeOptions(defaults, options);
    // @V2-todo Only used for legacy month view
    this.month = DateTime.local().startOf("month");

    if (timeOpt.days) {
      // If there was a startDate specified, we should figure out what
      // the weekday is and use that as the starting point of our
      // interval. If not, go to today.weekday(0).
      if (timeOpt.startDate) {
        this.intervalStart = DateTime.local()
          .set({ weekday: this._parse(timeOpt.startDate).weekday })
          .startOf("day");
      } else {
        this.intervalStart = DateTime.local()
          .set({ weekday: 0 })
          .startOf("day");
      }

      this.intervalEnd = this.intervalStart
        .plus({ days: timeOpt.days - 1 })
        .endOf("day");
    } else {
      // Set the intervalStart to this month.
      this.intervalStart = DateTime.local().startOf("month");
      this.intervalEnd = this.intervalStart
        .plus({ months: timeOpt.months || timeOpt.interval })
        .minus({ days: 1 })
        .endOf("month");
    }

    // No need to re-render if we didn't change months.
    if (
      !this.intervalStart.hasSame(orig.start, "millisecond") ||
      !this.intervalEnd.hasSame(orig.end, "millisecond")
    ) {
      this.render();
    }

    // Fire the today event handler regardless of any change
    if (options.withCallbacks) {
      if (this._options.clickEvents.today) {
        this._options.clickEvents.today.apply(this, [this.month]);
      }

      this.triggerEvents(orig);
    }
  };

  private todayAction = () => {
    this.today({
      withCallbacks: true
    });
  };

  /**
   * Changes the month. Accepts 0-11 or a full/partial month name e.g. "Jan",
   * "February", "Mar", etc.
   */
  public setMonth(newMonth: number, options: ActionOptions = {}): Clndr {
      var timeOpt = this._options.lengthOfTime,
          orig = {
              end: this.intervalEnd,
              start: this.intervalStart
          };

      if (timeOpt.days || timeOpt.months) {
          console.warn(
              'You are using a custom date interval. Use ' +
              'Clndr.setIntervalStart(startDate) instead.');
          return this;
      }

      this.month = this.month.set({month: newMonth});
      this.intervalStart = this.month.startOf('month');
      this.intervalEnd = this.intervalStart.endOf('month');
      this.render();

      if (options && options.withCallbacks) {
          this.triggerEvents(orig);
      }

      return this;
  };

  public setYear(newYear: number, options: ActionOptions = {}): Clndr {
      var orig = {
          end: this.intervalEnd,
          start: this.intervalStart
      };

      this.month = this.month.set({ year: newYear });
      this.intervalEnd = this.intervalEnd.set({ year: newYear });
      this.intervalStart = this.intervalStart.set({ year: newYear });
      this.render();

      if (options && options.withCallbacks) {
          this.triggerEvents(orig);
      }

      return this;
  };

  /**
   * Sets the start of the time period according to newDate. newDate can be
   * a string or a moment object.
   */
  public setIntervalStart(newDate: string | luxon.DateTime, options: ActionOptions = {}): Clndr  {
      var timeOpt = this._options.lengthOfTime,
          orig = {
              end: this.intervalEnd,
              start: this.intervalStart
          };
        newDate = this._parse(newDate);

      if (!timeOpt.days && !timeOpt.months) {
          console.log(
              'You are using a custom date interval. Use ' +
              'Clndr.setIntervalStart(startDate) instead.');
          return this;
      }

      if (timeOpt.days) {
          this.intervalStart = newDate.startOf('day');
          this.intervalEnd = this.intervalStart
              .plus({days: timeOpt.days - 1})
              .endOf('day');
      } else {
          this.intervalStart = newDate.startOf('month');
          this.intervalEnd = this.intervalStart
              .plus({months: timeOpt.months || timeOpt.interval})
              .minus({days: 1})
              .endOf('month');
      }

      this.month = this.intervalStart;
      this.render();

      if (options && options.withCallbacks) {
          this.triggerEvents(orig);
      }

      return this;
  };

  /**
   * Overwrites extras in the calendar and triggers a render.
   */
  public setExtras(extras: unknown): Clndr {
      this._options.extras = extras;
      this.render();
      return this;
  };

  /**
   * Overwrites events in the calendar and triggers a render.
   */
  public setEvents(events: ClndrEvent[]): Clndr {
      // Go through each event and add a moment object
      if (this._options.multiDayEvents) {
          this._options.events = this.addMultiDayMomentObjectsToEvents(events);
      } else {
          this._options.events = this.addMomentObjectToEvents(events);
      }

      this.render();
      return this;
  };

  /**
   * Adds additional events to the calendar and triggers a render.
   */
  public addEvents(events: ClndrEvent[], reRender: boolean = true): Clndr {
      // Go through each event and add a moment object
      if (this._options.multiDayEvents) {
          this._options.events = [
              ...this._options.events as InternalEvent[],
              ...this.addMultiDayMomentObjectsToEvents(events)
        ];
      } else {
        this._options.events = [
            ...this._options.events as InternalEvent[],
            ...this.addMomentObjectToEvents(events)
        ];
      }

      if (reRender) {
          this.render();
      }

      return this;
  };

  /**
   * Passes all events through a matching function. Any that pass a truth
   * test will be removed from the calendar's events. This triggers a render.
   */
  public removeEvents(filterFn: (event: ClndrEvent) => boolean): Clndr {
      const toRemove: ClndrEvent[] = [];
      for (const event of this._options.events) {
          if (filterFn(event) == true) {
              toRemove.push(event);
          }
      }

      for (const removeEvent of toRemove) {
          this._options.events.splice(this._options.events.indexOf(removeEvent));
      }

      this.render();
      return this;
  };

  /**
   * If the user provided a click callback we'd like to give them something
   * nice to work with. buildTargetObject takes the DOM element that was
   * clicked and returns an object with the DOM element, events, and the date
   * (if the latter two exist). Currently it is based on the id, however it'd
   * be nice to use a data- attribute in the future.
   */
  private buildTargetObject(currentTarget: HTMLElement, targetWasDay: boolean): ClndrEventTarget {
    // This is our default target object, assuming we hit an empty day
    // with no events.
    var target: ClndrEventTarget = {
      date: null,
      events: [],
      element: currentTarget
    };

    // Did we click on a day or just an empty box?
    if (targetWasDay) {
      target.date = this._parse(this.getTargetDateString(currentTarget));

      let filterFn: (event: InternalEvent) => boolean;
      // Do we have events?
      if (this._options.events) {
        // Are any of the events happening today?
        if (this._options.multiDayEvents) {
          filterFn = (e) => {
            var isSameStart = target.date.hasSame(
              e._clndrStartDateObject,
              "day"
            );
            var isAfterStart = this.isAfter(
              target.date,
              e._clndrStartDateObject,
              "day"
            );
            var isSameEnd = target.date.hasSame(e._clndrEndDateObject, "day");
            var isBeforeEnd = this.isBefore(
              target.date,
              e._clndrEndDateObject,
              "day"
            );
            return (isSameStart || isAfterStart) && (isSameEnd || isBeforeEnd);
          };
        } else {
          filterFn = (e) => {
            var startString = e._clndrStartDateObject.toFormat("yyyy-MM-dd");
            return startString == target.date.toFormat("yyyy-MM-dd");
          };
        }

        // Filter the dates down to the ones that match.
        target.events = (this._options.events || []).filter(filterFn);
      }
    }

    return target;
  }
  
  /**
   * Get moment date object of the date associated with the given target.
   * This method is meant to be called on ".day" elements.
   */
  private getTargetDateString(target: HTMLElement): string {
    // Our identifier is in the list of classNames. Find it!
    var classNameIndex = target.className.indexOf('calendar-day-');

    if (classNameIndex !== -1) {
        // Our unique identifier is always 23 characters long.
        // If this feels a little wonky, that's probably because it is.
        // Open to suggestions on how to improve this guy.
        return target.className.substring(
            classNameIndex + 'calendar-day-'.length,
            classNameIndex + 'calendar-day-'.length + 'yyyy-MM-dd'.length);
    }

    return null;
  }

  /**
   * Triggers any applicable events given a change in the calendar's start
   * and end dates. this contains the current (changed) start and end date,
   * orig contains the original start and end dates.
   */
  private triggerEvents(originalDays: { start: luxon.DateTime; end: luxon.DateTime; }) {
    const timeOpt = this._options.lengthOfTime,
      eventsOpt = this._options.clickEvents,
      newInt = {
        end: this.intervalEnd,
        start: this.intervalStart
      },
      intervalArg = [this.intervalStart, this.intervalEnd],
      monthArg = [this.month];

    // We want to determine if any of the change conditions have been
    // hit and then trigger our events based off that.
    const nextMonth =
      newInt.start > originalDays.start &&
      (Math.abs(newInt.start.month - originalDays.start.month) == 1 ||
        (originalDays.start.month === 11 && newInt.start.month === 0));
    const prevMonth =
      newInt.start < originalDays.start &&
      (Math.abs(originalDays.start.month - newInt.start.month) == 1 ||
        (originalDays.start.month === 0 && newInt.start.month === 11));
    const monthChanged =
      newInt.start.month !== originalDays.start.month ||
      newInt.start.year !== originalDays.start.year;
    const nextYear =
      newInt.start.year - originalDays.start.year === 1 ||
      newInt.end.year - originalDays.end.year === 1;
    const prevYear =
      originalDays.start.year - newInt.start.year === 1 ||
      originalDays.end.year - newInt.end.year === 1;
    const yearChanged = newInt.start.year !== originalDays.start.year;

    // Only configs with a time period will get the interval change event
    if (timeOpt.days || timeOpt.months) {
      const nextInterval = newInt.start > originalDays.start;
      const prevInterval = newInt.start < originalDays.start;
      const intervalChanged = nextInterval || prevInterval;

      if (nextInterval && eventsOpt.nextInterval) {
        eventsOpt.nextInterval.apply(this, intervalArg);
      }

      if (prevInterval && eventsOpt.previousInterval) {
        eventsOpt.previousInterval.apply(this, intervalArg);
      }

      if (intervalChanged && eventsOpt.onIntervalChange) {
        eventsOpt.onIntervalChange.apply(this, intervalArg);
      }
    }
    // @V2-todo see https://github.com/kylestetz/CLNDR/issues/225
    else {
      if (nextMonth && eventsOpt.nextMonth) {
        eventsOpt.nextMonth.apply(this, monthArg);
      }

      if (prevMonth && eventsOpt.previousMonth) {
        eventsOpt.previousMonth.apply(this, monthArg);
      }

      if (monthChanged && eventsOpt.onMonthChange) {
        eventsOpt.onMonthChange.apply(this, monthArg);
      }

      if (nextYear && eventsOpt.nextYear) {
        eventsOpt.nextYear.apply(this, monthArg);
      }

      if (prevYear && eventsOpt.previousYear) {
        eventsOpt.previousYear.apply(this, monthArg);
      }

      if (yearChanged && eventsOpt.onYearChange) {
        eventsOpt.onYearChange.apply(this, monthArg);
      }
    }
  }

  private addMomentObjectToEvents(events: ClndrEvent[]): InternalEvent[] {
    for (let event of events as InternalEvent[]) {
      event._clndrStartDateObject = this._parse(
        event[this._options.dateParameter]
      );
      event._clndrEndDateObject = this._parse(
        event[this._options.dateParameter]
      );
    }

    return events as InternalEvent[];
  }

  private addMultiDayMomentObjectsToEvents(
    events: ClndrEvent[]
  ): InternalEvent[] {
    const multiEvents = this._options.multiDayEvents!;
    for (let event of events as InternalEvent[]) {
      const start = event[multiEvents.startDate];
      const end = event[multiEvents.endDate];
      if (!end && !start) {
        event._clndrStartDateObject = this._parse(event[multiEvents.singleDay]);
        event._clndrEndDateObject = this._parse(event[multiEvents.singleDay]);
      } else {
        event._clndrStartDateObject = this._parse(start || end);
        event._clndrEndDateObject = this._parse(end || start);
      }
    }
    return events as InternalEvent[];
  }

  private _parse(date: string | luxon.DateTime | null): luxon.DateTime | null {
    if (!date) return null;
    if (DateTime.isDateTime(date)) return date;
    let dateTime = DateTime.fromISO(date);
    if (dateTime.isValid) return dateTime;
    dateTime = DateTime.fromRFC2822(date);
    if (dateTime.isValid) return dateTime;
    return DateTime.fromJSDate(new Date(date));
  }

  private isAfter(
    comparer: luxon.DateTime,
    comparee: luxon.DateTime,
    units: keyof luxon.DurationObjectUnits
  ) {
    if (units === "millisecond" || units === "milliseconds") {
      return comparer > comparee;
    }
    return comparee < comparer.startOf(units);
  }

  private isBefore(
    comparer: luxon.DateTime,
    comparee: luxon.DateTime,
    units: keyof luxon.DurationObjectUnits
  ) {
    if (units === "millisecond" || units === "milliseconds") {
      return comparer < comparee;
    }
    return comparer.endOf(units) < comparee;
  }

  private calendarDay(options: Partial<Day> & { classList: string[]}): Day {
      var defaults: Day = {
          id: null,
          day: null,
          date: null as luxon.DateTime,
          events: [],
          classes: this._options.targets.empty
      };

      if (options.classList && Array.isArray(options.classList)) {
        options.classes = (options.classes ? options.classes + " " : "") + options.classList.join(" ");
      }

      return mergeOptions(defaults, options);
  };

  public destroy() {
      if (!this.element) {
          return;
      }
      this.element.innerHTML = "";
      this.element = null;
      Clndr.nodeMap.delete(this.element);
  }

  public static getFromNode(node: Node): Clndr | null {
    return Clndr.nodeMap.has(node) ? Clndr.nodeMap.get(node) : null;
  }
}
