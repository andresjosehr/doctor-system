/**
 * App Calendar
 */

/**
 * ! If both start and end dates are same Full calendar will nullify the end date value.
 * ! Full calendar will end the event on a day before at 12:00:00AM thus, event won't extend to the end date.
 * ! We are getting events from a separate file named app-calendar-events.js. You can add or remove events from there.
 **/

'use-strict';

// RTL Support
var direction = 'ltr',
    assetPath = '../../../app-assets/';
if ($('html').data('textdirection') == 'rtl') {
    direction = 'rtl';
}

if ($('body').attr('data-framework') === 'laravel') {
    assetPath = $('body').attr('data-asset-path');
}

$(document).on('click', '.fc-sidebarToggle-button', function(e) {
    $('.app-calendar-sidebar, .body-content-overlay').addClass('show');
});

$(document).on('click', '.body-content-overlay', function(e) {
    $('.app-calendar-sidebar, .body-content-overlay').removeClass('show');
});

$(document).ready(() => {
  window.getEvents();
});

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar'),
        eventToUpdate,
        sidebar = $('.event-sidebar'),
        calendarsColor = {
            Business: 'primary',
            Holiday: 'success',
            Personal: 'danger',
            Family: 'warning',
            ETC: 'info'
        },
        eventForm = $('.event-form'),
        addEventBtn = $('.add-event-btn'),
        cancelBtn = $('.btn-cancel'),
        updateEventBtn = $('.update-event-btn'),
        toggleSidebarBtn = $('.btn-toggle-sidebar'),
        eventTitle = $('#title'),
        eventLabel = $('#select-label'),
        startDate = $('#start-date'),
        endDate = $('#end-date'),
        eventUrl = $('#event-url'),
        eventGuests = $('#event-guests'),
        eventLocation = $('#event-location'),
        allDaySwitch = $('.allDay-switch'),
        selectAll = $('.select-all'),
        calEventFilter = $('.calendar-events-filter'),
        filterInput = $('.input-filter'),
        btnDeleteEvent = $('.btn-delete-event'),
        calendarEditor = $('#event-description-editor');

    // --------------------------------------------
    // On add new item, clear sidebar-right field fields
    // --------------------------------------------
    $('.add-event button').on('click', function(e) {
        $('.event-sidebar').addClass('show');
        $('.sidebar-left').removeClass('show');
        $('.app-calendar .body-content-overlay').addClass('show');
    });

    // Label  select
    if (eventLabel.length) {
        function renderBullets(option) {
            if (!option.id) {
                return option.text;
            }
            var $bullet =
                "<span class='bullet bullet-" +
                $(option.element).data('label') +
                " bullet-sm mr-50'> " +
                '</span>' +
                option.text;

            return $bullet;
        }
        eventLabel.wrap('<div class="position-relative"></div>').select2({
            placeholder: 'Select value',
            dropdownParent: eventLabel.parent(),
            templateResult: renderBullets,
            templateSelection: renderBullets,
            minimumResultsForSearch: -1,
            escapeMarkup: function(es) {
                return es;
            }
        });
    }

    // Guests select
    if (eventGuests.length) {
        function renderGuestAvatar(option) {
            if (!option.id) {
                return option.text;
            }

            var $avatar =
                "<div class='d-flex flex-wrap align-items-center'>" +
                "<div class='avatar avatar-sm my-0 mr-50'>" +
                "<span class='avatar-content'>" +
                "<img src='" +
                assetPath +
                'images/avatars/' +
                $(option.element).data('avatar') +
                "' alt='avatar' />" +
                '</span>' +
                '</div>' +
                option.text +
                '</div>';

            return $avatar;
        }
        eventGuests.wrap('<div class="position-relative"></div>').select2({
            placeholder: 'Select value',
            dropdownParent: eventGuests.parent(),
            closeOnSelect: false,
            templateResult: renderGuestAvatar,
            templateSelection: renderGuestAvatar,
            escapeMarkup: function(es) {
                return es;
            }
        });
    }

    // Start date picker
    if (startDate.length) {
        var start = startDate.flatpickr({
            enableTime: true,
            altFormat: 'Y-m-dTH:i:S',
            onReady: function(selectedDates, dateStr, instance) {
                if (instance.isMobile) {
                    $(instance.mobileInput).attr('step', null);
                }
            }
        });
    }

    // End date picker
    if (endDate.length) {
        var end = endDate.flatpickr({
            enableTime: true,
            altFormat: 'Y-m-dTH:i:S',
            onReady: function(selectedDates, dateStr, instance) {
                if (instance.isMobile) {
                    $(instance.mobileInput).attr('step', null);
                }
            }
        });
    }

    // Event click function
    // To edit created events
    function eventClick(info) {

        const data = info.event._def.extendedProps

        $("#identifier").val(data.identifier);
        $("#appointment-date").val(data.appointmentDate);
        $("#appointment-time").val(data.appointmentTime);
        $("#for_appointment").val(data.forAppointment);
        $("#service").val(data.service);


        eventToUpdate = info.event;
        if (eventToUpdate.url) {
            info.jsEvent.preventDefault();
            window.open(eventToUpdate.url, '_blank');
        }

        sidebar.modal('show');
        addEventBtn.addClass('d-none');
        /* cancelBtn.addClass('d-none'); */
        updateEventBtn.removeClass('d-none');
        btnDeleteEvent.removeClass('d-none');

        //  Delete Event
        btnDeleteEvent.on('click', function() {
            eventToUpdate.remove();
            // removeEvent(eventToUpdate.id);
            sidebar.modal('hide');
            $('.event-sidebar').removeClass('show');
            $('.app-calendar .body-content-overlay').removeClass('show');
        });
    }

    // Modify sidebar toggler
    function modifyToggler() {
        $('.fc-sidebarToggle-button')
            .empty()
            .append(feather.icons['menu'].toSvg({ class: 'ficon' }));
    }

    // Selected Checkboxes
    function selectedCalendars() {
        var selected = [];
        $('.calendar-events-filter input:checked').each(function() {
            selected.push($(this).attr('data-value'));
        });
        return selected;
    }

    // --------------------------------------------------------------------------------------------------
    // AXIOS: fetchEvents
    // * This will be called by fullCalendar to fetch events. Also this can be used to refetch events.
    // --------------------------------------------------------------------------------------------------
    function fetchEvents(info, successCallback) {
        // Fetch Events from API endpoint reference
        /* $.ajax(
          {
            url: '../../../app-assets/data/app-calendar-events.js',
            type: 'GET',
            success: function (result) {
              // Get requested calendars as Array
              var calendars = selectedCalendars();

              return [result.events.filter(event => calendars.includes(event.extendedProps.calendar))];
            },
            error: function (error) {
              console.log(error);
            }
          }
        ); */

        var calendars = selectedCalendars();
        // We are reading event object from app-calendar-events.js file directly by including that file above app-calendar file.
        // You should make an API call, look into above commented API call for reference
        selectedEvents = events.filter(function(event) {
            // console.log(event.extendedProps.calendar.toLowerCase());
            return calendars.includes(event.extendedProps.calendar.toLowerCase());
        });
        // if (selectedEvents.length > 0) {
        successCallback(selectedEvents);
        // }
    }

    // Calendar plugins
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: fetchEvents,
        editable: true,
        dragScroll: true,
        dayMaxEvents: 2,
        eventResizableFromStart: true,
        selectable: true,
        select: function(start, end, jsEvent, view) {

            $("#forappointment").val("")
            $("#appointment-time").val("")
            $("#appointment-date").val(start.startStr)

        },
        customButtons: {
            sidebarToggle: {
                text: 'Sidebar'
            },
            buttonRefresh: {
                text: 'Refresh',
                click: function() {
                    alert('Hice click');
                }
            }
        },
        headerToolbar: {
            start: 'sidebarToggle,buttonRefresh, prev,next, title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        direction: direction,
        initialDate: new Date(),
        navLinks: true, // can click day/week names to navigate views
        eventClassNames: function({ event: calendarEvent }) {
            const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar];

            return [
                // Background Color
                'bg-light-' + colorName
            ];
        },
        dateClick: function(info) {
            var date = moment(info.date).format('YYYY-MM-DD');
            resetValues();
            sidebar.modal('show');
            addEventBtn.removeClass('d-none');
            updateEventBtn.addClass('d-none');
            btnDeleteEvent.addClass('d-none');
            startDate.val(date);
            endDate.val(date);
        },
        eventClick: function(info) {
            eventClick(info);
        },
        datesSet: function() {
            modifyToggler();
        },
        viewDidMount: function() {
            modifyToggler();
        }
    });

    // Render calendar
    calendar.render();
    // Modify sidebar toggler
    modifyToggler();
    // updateEventClass();

    // Validate add new and update form
    if (eventForm.length) {
        eventForm.validate({
            submitHandler: function(form, event) {
                event.preventDefault();
                if (eventForm.valid()) {
                    sidebar.modal('hide');
                }
            },
            title: {
                required: true
            },
            'start-date': {
                required: true
            },
            'end-date': {
                required: true
            }
        });
    }

    // Sidebar Toggle Btn
    if (toggleSidebarBtn.length) {
        toggleSidebarBtn.on('click', function() {
            cancelBtn.removeClass('d-none');
        });
    }


    window.getEvents=()=>{
      const request = window.getAppointments();

      request.done(function(response, textStatus, jqXHR) {
        response.map(appointment =>{

          let month  = appointment.mes.toString().length == 1 ? "0"+appointment.mes : appointment.mes
          let day    = appointment.dia.toString().length == 1 ? "0"+appointment.dia : appointment.dia
          let hour   = appointment.hora.toString().length == 1 ? "0"+appointment.hora : appointment.hora
          let minute = appointment.minuto.toString().length == 1 ? "0"+appointment.minuto : appointment.minuto


        calendar.addEvent({
              id: calendar.getEvents().length + 1,
              title: `${hour}:${minute} ${appointment.for_appointment}`,
              start: `${appointment.ano}-${month}-${day}`,
              extendedProps: {
                  identifier: response.identifier,
                  appointmentDate: `${appointment.ano}-${month}-${day}`,
                  appointmentTime: `${hour}:${minute}`,
                  forAppointment: appointment.for_appointment,
                  service: appointment.service.identifier
              }
          });
        })
        calendar.refetchEvents();

      });

      request.fail(function(jqXHR, textStatus, errorThrown) {
          alert("Se ha producido un error en la consulta de appointments")
      });
    }

    // ------------------------------------------------
    // addEvent
    // ------------------------------------------------
    function addEvent(eventData) {

      $("#form-error").hide()

      if(
        !$("#appointment-date").val() ||
        !$("#appointment-time").val() ||
        !$("#for_appointment").val()  ||
        !$("#service").val()
      ){
        // $("#form-error").show()
        return;
      } 

        calendar.addEvent({
            id: calendar.getEvents().length + 1,
            title: `${$("#appointment-time").val()} ${$("#for_appointment").val()}`,
            start: $("#appointment-date").val(),
            extendedProps: {
                identifier: "4ads6f8415-dtgh15e521rtb8-sdfe8tb",
                appointmentDate: $("#appointment-date").val(),
                appointmentTime: $("#appointment-time").val(),
                forAppointment: $("#for_appointment").val(),
                service: $("#service").val()
            }
        });

        calendar.refetchEvents();
        window.saveAppointment();

    }

    // ------------------------------------------------
    // updateEvent
    // ------------------------------------------------
    function updateEvent(eventData) {
        var propsToUpdate = ['id', 'title'];
        var extendedPropsToUpdate = ["appointmentDate", "appointmentTime", "forAppointment", "service"];

        updateEventInCalendar(eventData, propsToUpdate, extendedPropsToUpdate);
    }

    // ------------------------------------------------
    // removeEvent
    // ------------------------------------------------
    function removeEvent(eventId) {
        removeEventInCalendar(eventId);
    }

    // ------------------------------------------------
    // (UI) updateEventInCalendar
    // ------------------------------------------------
    const updateEventInCalendar = (updatedEventData, propsToUpdate, extendedPropsToUpdate) => {
        
        const existingEvent = calendar.getEventById(updatedEventData.id);

        // --- Set event properties except date related ----- //
        // ? Docs: https://fullcalendar.io/docs/Event-setProp
        // dateRelatedProps => ['start', 'end', 'allDay']
        // eslint-disable-next-line no-plusplus
        for (var index = 0; index < propsToUpdate.length; index++) {
            var propName = propsToUpdate[index];
            existingEvent.setProp(propName, updatedEventData[propName]);
        }

        // --- Set event's extendedProps ----- //
        // ? Docs: https://fullcalendar.io/docs/Event-setExtendedProp
        // eslint-disable-next-line no-plusplus
        for (var index = 0; index < extendedPropsToUpdate.length; index++) {
            var propName = extendedPropsToUpdate[index];
            existingEvent.setExtendedProp(propName, updatedEventData.extendedProps[propName]);
        }

    };

    // ------------------------------------------------
    // (UI) removeEventInCalendar
    // ------------------------------------------------
    function removeEventInCalendar(eventId) {
        calendar.getEventById(eventId).remove();
    }

    // Add new event
    $(addEventBtn).on('click', function() {
        if (eventForm.valid()) {
            var newEvent = {
                id: calendar.getEvents().length + 1,
                time: eventTitle.val(),
                service: startDate.val()
            };
        }

        addEvent(newEvent);

    });

    // Update new event
    updateEventBtn.on('click', function() {

      $("#form-error").hide()

      if(
        !$("#appointment-date").val() ||
        !$("#appointment-time").val() ||
        !$("#for_appointment").val()  ||
        !$("#service").val()
      ){
        // $("#form-error").show()
        return;
      }

        var eventData = {
            id: eventToUpdate.id,
            title: `${$("#appointment-time").val()} ${$("#for_appointment").val()}`,
            start: $("#appointment-date").val(),
            extendedProps: {
                identifier: "4ads6f8415-dtgh15e521rtb8-sdfe8tb",
                appointmentDate: $("#appointment-date").val(),
                appointmentTime: $("#appointment-time").val(),
                forAppointment: $("#for_appointment").val(),
                service: $("#service").val()
            }
        };

        updateEvent(eventData);
        sidebar.modal('hide');
    });

    // Reset sidebar input values
    function resetValues() {
        endDate.val('');
        eventUrl.val('');
        startDate.val('');
        eventTitle.val('');
        eventLocation.val('');
        allDaySwitch.prop('checked', false);
        eventGuests.val('').trigger('change');
        calendarEditor.val('');
    }

    // When modal hides reset input values
    sidebar.on('hidden.bs.modal', function() {
        resetValues();
    });

    // Hide left sidebar if the right sidebar is open
    $('.btn-toggle-sidebar').on('click', function() {
        btnDeleteEvent.addClass('d-none');
        updateEventBtn.addClass('d-none');
        addEventBtn.removeClass('d-none');
        $('.app-calendar-sidebar, .body-content-overlay').removeClass('show');
    });

    // Select all & filter functionality
    if (selectAll.length) {
        selectAll.on('change', function() {
            var $this = $(this);

            if ($this.prop('checked')) {
                calEventFilter.find('input').prop('checked', true);
            } else {
                calEventFilter.find('input').prop('checked', false);
            }
            calendar.refetchEvents();
        });
    }

    if (filterInput.length) {
        filterInput.on('change', function() {
            $('.input-filter:checked').length < calEventFilter.find('input').length ?
                selectAll.prop('checked', false) :
                selectAll.prop('checked', true);
            calendar.refetchEvents();
        });
    }
});