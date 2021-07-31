// Global variable
var alert_setup = false;
var notification_permission = false;
var server_alert = new Map()
var timer_val = 13;
var button_background = 'rgb(43, 43, 43)'

// Audio to play
var alert_audio = new Audio('/static/audio/FFXIV_Linkshell_Transmission.mp3');

function setup_alert(data)
{
    for (const [key, value] of Object.entries(data))
    {
        for (var count = 0; count < value.length; count++)
        {
            server_alert.set(value[count][0], [false, false]);
        }
    }

    // Set setup to true
    alert_setup = true;
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

function get_notification_permission()
{
    //If we haven't ask for notification permission do so...
    if (!notification_permission)
    {
        Notification.requestPermission();
        notification_permission = true;
    }
}

function send_alerts()
{
    check_alerts = get_checked_boxes();
    new_alerts = []

    for (var count = 0; count < check_alerts.length; count++)
    {
        // If it is a checkbox
        if (server_alert.get(check_alerts[count])[1])
        {
            // If alert status is false
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
        alert_audio.play()

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
                icon: '/static/images/favicon.png', 
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
        $.getJSON('http://www.ffxivalert.com/data', function (data) 
        {
            // If the alerts have not been setup, setup the alerts
            if (!alert_setup)
            {
                setup_alert(data);
            }

            // For each key
            $.each(data, function(key, val)
            {
                for (var count = 0; count < val.length; count++)
                {
                    if (!val[count][3])
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<img class=\"offline-icon\" style=\"color: red;\" src=\"/static/images/offline.svg\">";

                        // If server is offline, reset alert status to false
                        server_alert.set(val[count][0], [false, false]);
                    }
                    else if (val[count][2])
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<i class=\"fas fa-check\" style=\"color: green;\"></i>";

                        server_alert.set(val[count][0], [server_alert.get(val[count][0])[0], true])
                    }
                    else
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<i class=\"fas fa-times\" style=\"color: red;\"></i>";

                        // If server is closed, reset alert status to false
                        server_alert.set(val[count][0], [false, false]);
                    }
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