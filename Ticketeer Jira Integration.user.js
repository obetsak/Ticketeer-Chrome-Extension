// ==UserScript==
// @name         Ticketeer Jira Integration
// @namespace    my.Home
// @version      0.1
// @description  Creates a ticketeer ticket
// @author       Erik Österholm
// @grant        none
// @include      https://access.istone.se*
// ==/UserScript==

var myTimeout;
var apiKey = '';
var userName = '';
var passWord = '';

AJS.$(document).ready(function() {
    if (apiKey === ""){return;}
    checkDOMChange();
});

function checkDOMChange()
{
    ticketeerCreate();
    myTimeout = setTimeout(function(){ checkDOMChange(); }, 500);
}

function ticketeerCreate()
{
    if (AJS.$("#createTicket").length > 0  || AJS.$("#summary-val").length === 0)
    {
        return;
    }

    if (AJS.$("#customStyle").length === 0)
    {
        AJS.$(document.body).append('<style id="customStyle">#BoardList{height:30px;margin-left:5px;} #StatusMessage{padding:5px;background-color:#56B62E;color:black;font-weight:bold;display:inline-block;margin-right:5px;border-radius:4px;border:1px solid transparent;border-color:#69BB47;} </style>');
    }

    var createTicketButton = AJS.$('<button id="createTicket" class="aui-button aui-button-primary aui-style">Skapa Ticketeer</button>');
    createTicketButton.insertAfter('#summary-val');


    setBoards(apiKey, userName, passWord);

    AJS.$('#createTicket').on("click", function (e) {
        e.preventDefault();

        console.log("button clicked");

        var selected = AJS.$("#BoardList").val();

        if (selected != "0")
        {
            var title = "";
            AJS.$.each(AJS.$('.aui-page-header-main .issue-link'), function () {
                title += AJS.$(this).text() + ' ';
            });

            if (AJS.$('#type-val').text().indexOf("Change request") > -1) {
                title = 'CR ' + title;
            }

            title += AJS.$('#summary-val').text();

            createTicket(apiKey, userName, passWord, title, selected, 'http://' + window.location.hostname + window.location.pathname);
        }


    });

}

function createTicket(apikey, user, pass, title, boardId, desc)
{
    console.log("Creating ticket with title: " + title + " and boardid: " + boardId + " desc:" + desc);

    AJS.$.ajax ( {
        type:       'POST',
        url:        'https://www.ticketeer.se/api/create_task',
        dataType: 'json',
        data: { key: apikey, board_id: boardId, task_title: title, task_description: desc},
        beforeSend: function (xhr){
            xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass));
        },
        success:    function (data) {

            if (data.result && data.result == "success")
            {
                showMessage("Ticket skapad med ID: " + data.objectCreated.id);

            }

        }
    } );
}

function showMessage(messge)
{
    AJS.$('<div id="StatusMessage">' + messge + '</div>').delay(5000).fadeOut(300).insertAfter("#summary-val");
}

function setBoards(apikey, user, pass)
{

    AJS.$.ajax ( {
        type:       'POST',
        url:        'https://www.ticketeer.se/api/get_boards',
        dataType: 'json',
        data: { key: apikey},
        beforeSend: function (xhr){
            xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass));
        },
        success:    function (data) {

            if (data)
            {
                if (data.result)
                {
                    showMessage(data.result);
                    return;
                }

                var boardDropdown = AJS.$('<select id="BoardList"></select>');

                AJS.$(boardDropdown).append('<option value="0">Välj board att skapa i</option>');

                for (var i = 0; i < data.length; i++) {
                    AJS.$(boardDropdown).append('<option value="' + data[i].id + '">' + data[i].name + '</option>');
                }

                boardDropdown.insertAfter('#createTicket');

            }
        }
    } );
}