/*
    Note: sever_alert is an map of server names to a list of two boolean. The first represents whether an
    alert has been sent (True = Sent, False = Not sent). The second boolean represents whether a server is
    currently open for character creation (True = CC open, False = CC closed). For an alert to be sent on
    that server both booleans must be true.
*/

// Global variable
var alert_setup = false;
var notification_permission = false;
var server_alert = new Map()
var timer_val = 13;
var button_background = 'rgb(43, 43, 43)'

// REST endpoint
var url = 'https://ffxiv-alert-api.herokuapp.com/ffxiv-server-status'

// Audio to play on an alert
var alert_audio = new Audio('audio/FFXIV_Linkshell_Transmission.mp3');

function page_load(div_name)
{
    // Show the correct div
    show_div(div_name);

    // When document is ready
    $(document).ready(function () 
    {
        // Get the JSON request
        $.getJSON(url, function (data) 
        {
            // Setup alerts
            setup_alert(data);

            // For each key
            $.each(data, function(key, val)
            {
                // If false, the server is offline
                if (!val[2])
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<img class=\"offline-icon\" src=\"images/offline.svg\">";

                    // If server is offline, reset alert status to false
                    server_alert.set(key, [false, false]);

                }
                // If true, cc is open
                else if (val[1])
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<i class=\"fas fa-check\" style=\"color: green;\"></i>";

                    // If server cc is open, set proper alert-status to true
                    server_alert.set(key, [server_alert.get(key)[0], true]);
                }
                // Else, CC must be closed
                else
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<i class=\"fas fa-times\" style=\"color: red;\"></i>";

                    // If cc is closed, reset alert status to false
                    server_alert.set(key, [false, false]);
                }
            });
        });
    });
}

// Sets initial alert-status (called when the page is loaded)
function setup_alert(data)
{
    // For each server, set the initial alert status
    for (const [key] of Object.entries(data))
    {
        server_alert.set(key, [false, false]);
    }

    // Set setup to true
    alert_setup = true;
}

// Reads a cookie to determine what checkboxes were checked
function check_previously_checkboxes()
{
    try
    {
        var checked_boxes = document.cookie.split('; ')[0].split('=')[1].split(',')

        for (var count = 0; count < checked_boxes.length; count++)
        {
            document.getElementById(checked_boxes[count]).checked = true;
        }
    }
    catch(error)
    {
        // No cookies must be set... just pass
    }
}

// Shows a div while hiding the other divs that are not shown
function show_div(div_name)
{
    //Show the selected table
    document.getElementById(div_name.id).style.display = "block";   

    // Hide the other two divs and apply proper formatting
    if (div_name.id != "japanese_table")
    {
        document.getElementById("japanese_table").style.display = "none";
        document.getElementById("japanese_button").style.background = "";
        document.getElementById("japanese_button").style.color = "black";
    }
    else
    {
        document.getElementById("japanese_button").style.background = button_background;
        document.getElementById("japanese_button").style.color = "white";
    }
    if (div_name.id != "american_table")
    {
        document.getElementById("american_table").style.display = "none";
        document.getElementById("american_button").style.background = "";
        document.getElementById("american_button").style.color = "black";
    }
    else
    {
        document.getElementById("american_button").style.background = button_background;
        document.getElementById("american_button").style.color = "white";
    }
    if (div_name.id != "european_table")
    {
        document.getElementById("european_table").style.display = "none";
        document.getElementById("european_button").style.background = "";
        document.getElementById("european_button").style.color = "black";
    }
    else
    {
        document.getElementById("european_button").style.background = button_background;
        document.getElementById("european_button").style.color = "white";
    }
}

// Returns a list of Id's for boxes that are currently checked
function get_checked_boxes()
{
    var checkboxes = document.getElementsByClassName("form-check-input");
    var checked_boxes = [];

    for(var count = 0; count < checkboxes.length; count++)
    {
        if (checkboxes[count].checked)
        {
            checked_boxes.push(checkboxes[count].id)
        }
        else
        {
            // Reset status alert status for unchecked boxes
            server_alert.set(checkboxes[count].id, [false, server_alert.get(checkboxes[count].id)[1]]);
        }
    }

    return checked_boxes
}

// Called when a checkbox is checked to ask the user for notification permissions
function record_checkbox_click()
{
    // If we haven't asked for permission to send notifications, ask for permission
    if (!notification_permission)
    {
        Notification.requestPermission();
        notification_permission = true;
    }

    // Set cookie
    var checked_boxes = get_checked_boxes();

    if (checked_boxes.length <= 0)
    {
        document.cookie = 'checked_boxes=';
    }
    else
    {
        document.cookie = 'checked_boxes=' + checked_boxes;
    }
}

// Sends an alert or alerts when CC is open and that server checkbox is checked
function send_alerts()
{
    check_alerts = get_checked_boxes();
    new_alerts = []

    // For all checked boxes
    for (var count = 0; count < check_alerts.length; count++)
    {
        // If CC is open
        if (server_alert.get(check_alerts[count])[1])
        {
            // If alert status is false (no alert has been sent for this server yet)
            if (!server_alert.get(check_alerts[count])[0])
            {
                new_alerts.push(check_alerts[count]);
                server_alert.set(check_alerts[count], [true, server_alert.get(check_alerts[count])[1]]);
            }
        }
    }

    // If new alerts > 0, play alert sound
    if (new_alerts.length > 0)
    {
        alert_audio.play();

        // Send the notification if allowed
        if (Notification.permission === "granted")
        {
            // Create notification body
            if (new_alerts.length > 1)
            {
                var body_str = "The servers "
                for (var count = 0; count < new_alerts.length; count++)
                {
                    body_str += new_alerts[count] + ", ";
                }
                body_str += "are open for character creation."
            }
            else
            {
                var body_str = new_alerts[0] + " is open for character creation.";
            }
            
            // Javascript Notification
            var notification = new Notification
            (
                "FFXIV Alert", 
                {
                body: body_str, 
                icon: 'images/favicon.png', 
                vibrate: true
                }
            )

            // Notification timeout = 10seconds
            setTimeout(() => {
                notification.close();
            }, 10 * 1000);
        }
    }
}

// Runs every 15 seconds to update page content
$(document).ready(function () 
{
    setInterval(function () 
    {
        // Get the JSON request
        $.getJSON(url, function (data) 
        {
            // For each key
            $.each(data, function(key, val)
            {
                // If false, the server is offline
                if (!val[2])
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<img class=\"offline-icon\" src=\"images/offline.svg\">";

                    // If server is offline, reset alert status to false
                    server_alert.set(key, [false, false]);

                }
                // If true, cc is open
                else if (val[1])
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<i class=\"fas fa-check\" style=\"color: green;\"></i>";

                    // If server cc is open, set proper alert-status to true
                    server_alert.set(key, [server_alert.get(key)[0], true]);
                }
                // Else, CC must be closed
                else
                {
                    document.getElementById(key + "-status-icon").innerHTML = "<i class=\"fas fa-times\" style=\"color: red;\"></i>";

                    // If cc is closed, reset alert status to false
                    server_alert.set(key, [false, false]);
                }
            });

            // Send alerts if any are ready to be sent
            send_alerts();

            // Update timer
            document.getElementById("update-text").innerHTML = 'Next update in 14 seconds...';
            timer_val = 13;
        });
    }, 15000);
});

// Updates the page timer at 1 second intervals
$(document).ready(function () 
{
    setInterval(function () 
    {
        // Update timer
        if (timer_val > 1)
        {
            document.getElementById("update-text").innerHTML = 'Next update in ' + timer_val + ' seconds...';
        }
        else if (timer_val == 1)
        {
            document.getElementById("update-text").innerHTML = 'Next update in ' + timer_val + ' second...';
        }
        else
        {
            document.getElementById("update-text").innerHTML = 'Updating...';
        }

        // Next timer value
        timer_val -= 1;
    }, 1000);
});

// Uncheck all the currently checked boxes
function uncheck_all()
{
    var checked_boxes = get_checked_boxes();

    for (var count = 0; count < checked_boxes.length; count++)
    {
        document.getElementById(checked_boxes[count]).checked = false;
    }
}

// Plays an alert sound and notification example
function example_alert()
{
    alert_audio.play();

    // Send the notification if allowed
    if (Notification.permission === "granted")
    {        
        // Javascript Notification
        var notification = new Notification
        (
            "FFXIV Alert", 
            {
            body: 'This is an example notification alert.', 
            icon: 'images/favicon.png', 
            vibrate: true
            }
        )

        // Notification timeout = 10seconds
        setTimeout(() => {
            notification.close();
        }, 10 * 1000);
    }
    else
    {
        Notification.requestPermission();
        notification_permission = true;
        alert('Please press allow to enable alert notifications from this website. Then try pressing the example button again to see a notification.');   
    }
}