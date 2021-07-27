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