// Shows a div while hiding the other divs that are not shown
function show_div(div_name)
{
    //Show the selected table
    document.getElementById(div_name.id).style.display = "block";

    // Hide the other two divs
    if (div_name.id != "japanese_table")
    {
        document.getElementById("japanese_table").style.display = "none";
    }
    if (div_name.id != "american_table")
    {
        document.getElementById("american_table").style.display = "none";
    }
    if (div_name.id != "european_table")
    {
        document.getElementById("european_table").style.display = "none";
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
    }

    return checked_boxes
}

// Runs every 15 seconds to update page content
$(document).ready(function () 
{
    setInterval(function () 
    {
        // Get the JSON request
        $.getJSON('http://127.0.0.1:5000/data', function (data) 
        {
            // For each key
            $.each(data, function(key, val)
            {
                for (var count = 0; count < val.length; count++)
                {
                    if (!val[count][3])
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<img class=\"offline-icon\" style=\"color: red;\" src=\"/static/images/offline.svg\">";
                    }
                    else if (val[count][2])
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<i class=\"fas fa-check\" style=\"color: green;\"></i>";
                    }
                    else
                    {
                        document.getElementById(val[count][0] + "-status-icon").innerHTML = "<i class=\"fas fa-times\" style=\"color: red;\"></i>";
                    }
                }
            });
        });
    }, 15000);
});