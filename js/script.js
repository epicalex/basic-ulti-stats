$(function() {
    var firstHalf = true;
    var team1Offense = true;
    var team1HasDisc = true;
    var team1ScoredLast = [];
    var team1Turns = 0;
    var team2Turns = 0;
    var team1Goals = 0;
    var team2Goals = 0;
    var tableData = ["<table id='data' class='table table-bordered table-condensed'><tr><th colspan='2' class='team1'>Offense Team Name</th><th class='notop'></th><th colspan='2' class='team2'>Defense Team Name</th></tr><tr><th>Turns</th><th>O/D</th><th>Score</th><th>O/D</th><th>Turns</th></tr></table>"];
    var inputs = [];
    var scoretable = [];

    function ScoreEntry(_Team1Turns, _Team1Side, _Team1Score, _Team2Turns, _Team2Side, _Team2Score, _Team1Scored) {
        this.Team1Turns = _Team1Turns;
        this.Team1Side = _Team1Side;
        this.Team1Score = _Team1Score;
        this.Team2Turns = _Team2Turns;
        this.Team2Side = _Team2Side;
        this.Team2Score = _Team2Score;
        this.Team1Scored = _Team1Scored;
    }

    function Results() {
        this.PointsPlayed = [0, 0];
        this.GoalsScored = [0, 0];
        this.Turnovers = [0, 0];
        this.Blocks = [0, 0];
        this.Breaks = [0, 0];
        this.NoTurnGoals = [0, 0];
        this.GoalsWithTurns = [0, 0];
        this.HadDiscPoints = [0, 0];
        this.ConversionRate = [0, 0];
        this.PerfectConversionRate = [0, 0];
        this.MeanTurnsPerPoint = [0, 0];
        this.RecoveryRate = [0, 0];
        this.DefensiveSuccessRate = 0;
    }

    var team1Results = new Results();
    var team2Results = new Results();


    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    if (window.location.href.indexOf('?gameUUID=') != -1) {
        

        var gameUUID = getUrlVars().gameUUID;
        gameUUID = decodeURI(gameUUID);

        scoretable = JSON.parse(localStorage.getItem(gameUUID + ' scoretable'));
        firstHalf = JSON.parse(localStorage.getItem(gameUUID + ' firstHalf'));
        team1Offense = JSON.parse(localStorage.getItem(gameUUID + ' team1Offense'));
        team1HasDisc = JSON.parse(localStorage.getItem(gameUUID + ' team1HasDisc'));
        team1ScoredLast = JSON.parse(localStorage.getItem(gameUUID + ' team1ScoredLast'));
        team1Turns = JSON.parse(localStorage.getItem(gameUUID + ' team1Turns'));
        team2Turns = JSON.parse(localStorage.getItem(gameUUID + ' team2Turns'));
        team1Goals = JSON.parse(localStorage.getItem(gameUUID + ' team1Goals'));
        team2Goals = JSON.parse(localStorage.getItem(gameUUID + ' team2Goals'));
        inputs = JSON.parse(localStorage.getItem(gameUUID + ' inputs'));

        $('body').html(localStorage.getItem(gameUUID + ' details'));

        $('#score, #turnover, #halftime, #undo').parent().addClass("hidden");
        $('#edit').parent().removeClass("hidden");
        
        $('#edit').on('click', function() {
            $(this).parent().addClass("hidden");
            $('#score, #turnover, #halftime, #undo').parent().removeClass("hidden");

            $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
        });


    }    

    $("#gameTitle").blur(function() {
        $("#title").html($("#gameTitle").html() + ": " + $("#team1name").html() + " vs " + $("#team2name").html());
        var gameUUID = $('#gameTitle').html();
        var gameUUIDs = localStorage.getItem('gameUUIDs');
        if (gameUUIDs !== null) {
            gameUUIDs = gameUUID + ', ' + gameUUIDs;
        } else {
            gameUUIDs = gameUUID;
        }
        localStorage.setItem("gameUUIDs", gameUUIDs);
        localStorage.setItem(gameUUID + ' details', $("body").html());
    });

    $("#team1name").blur(function() {
        $(".team1").html($("#team1name").html());
        $("#title").html($("#gameTitle").html() + ": " + $("#team1name").html() + " vs " + $("#team2name").html());
        var gameUUID = $('#gameTitle').html();
        localStorage.setItem(gameUUID + ' team1name', $(this).html());
        localStorage.setItem(gameUUID + ' details', $("body").html());
    });

    $("#team2name").blur(function() {
        $(".team2").html($("#team2name").html());
        $("#title").html($("#gameTitle").html() + ": " + $("#team1name").html() + " vs " + $("#team2name").html());
        var gameUUID = $('#gameTitle').html();
        localStorage.setItem(gameUUID + ' team2name', $(this).html());
        localStorage.setItem(gameUUID + ' details', $("body").html());
    });

    $("#turnover").click(function() {
        var gameUUID = $('#gameTitle').html();
        if (team1HasDisc) {
            team1Turns += 1;
            changeTeamColour(false);
        } else {
            team2Turns += 1;
            changeTeamColour(true);
        }
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
        team1HasDisc = !team1HasDisc;

        localStorage.setItem(gameUUID + ' team1Turns', team1Turns);
        localStorage.setItem(gameUUID + ' team2Turns', team2Turns);
        localStorage.setItem(gameUUID + ' team1HasDisc', team1HasDisc);

        inputs.push("turnover");

        localStorage.setItem(gameUUID + ' inputs', JSON.stringify(inputs));
        localStorage.setItem(gameUUID + ' details', $("body").html());

        $("#halftime").attr("disabled", true);
        $("#undo").attr("disabled", false);
    });

    $("#score").click(function() {
        var team1scored;
        var team1Side;
        var team2Side;
        var team1Class = "";
        var team2Class = "";
        var gameUUID = $("#gameTitle").html();

        if (team1Offense) {
            team1Side = "O";
            team2Side = "D";
        } else {
            team1Side = "D";
            team2Side = "O";
        }

        if (team1HasDisc) {
            team1scored = true;
            team1Goals += 1;
            $("#team1score").html(team1Goals);
            localStorage.setItem(gameUUID + ' team1Goals', team1Goals);

            $("#team1mode").html("Defense");
            $("#team2mode").html("Offense");
            team1ScoredLast.push(true);
            localStorage.setItem(gameUUID + ' team1ScoredLast', JSON.stringify(team1ScoredLast));

            if (team1Offense) {
                team1Class = "hold";
                team2Class = "conceded";
                (team1Turns === 0) ? team1Class += " perfect" : team1Class += "";
            } else {
                team1Class = "break";
                team2Class = "broken";
                (team1Turns === 0) ? team1Class += " perfect" : team1Class += "";
            }

            team1Offense = false;
            localStorage.setItem(gameUUID + ' team1Offense', team1Offense);
        } else {
            team1scored = false;
            team2Goals += 1;
            $("#team2score").html(team2Goals);
            localStorage.setItem(gameUUID + ' team2Goals', team2Goals);

            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
            team1ScoredLast.push(false);
            localStorage.setItem(gameUUID + ' team1ScoredLast', JSON.stringify(team1ScoredLast));

            if (team1Offense) {
                team2Class = "break";
                team1Class = "broken";
                if (team2Turns === 0) {
                    team2Class += " perfect";
                }
            } else {
                team2Class = "hold";
                team1Class = "conceded"
                if (team2Turns === 0) {
                    team2Class += " perfect";
                }
            }

            team1Offense = true;
            localStorage.setItem(gameUUID + ' team1Offense', team1Offense);
        }

        var entry = new ScoreEntry(team1Turns, team1Side, team1Goals, team2Turns, team2Side, team2Goals, team1scored);
        scoretable.push(entry);
        localStorage.setItem(gameUUID + ' scoretable', JSON.stringify(scoretable));

        var newRow = "<tr><td class='" + team1Class + "'>" + entry.Team1Turns + "</td><td class='" + team1Class + "'>" + entry.Team1Side + "</td><td>" + entry.Team1Score + "-" + entry.Team2Score + "</td><td class='" + team2Class + "'>" + entry.Team2Side + "</td><td class='" + team2Class + "'>" + entry.Team2Turns + "</td></tr>";
        tableData.push(newRow);
        $("#pointByPoint").append(newRow);

        team1HasDisc = !team1HasDisc;
        localStorage.setItem(gameUUID + ' inputs', team1HasDisc);

        changeTeamColour(team1HasDisc);
        resetTurnovers();

        firstHalf ? $("#halftime").attr("disabled", false) : $("#halftime").attr("disabled", true);

        updateTable();
        inputs.push("score");
        $("#undo").attr("disabled", false);

        localStorage.setItem(gameUUID + ' inputs', JSON.stringify(inputs));
        localStorage.setItem(gameUUID + ' details', $("body").html());
    });

    $("#halftime").click(function() {
        firstHalf = false;
        team1Offense = false;
        team1HasDisc = false;
        var gameUUID = $("#gameTitle").html();

        localStorage.setItem(gameUUID + ' firstHalf', firstHalf);
        localStorage.setItem(gameUUID + ' team1Offense', team1Offense);
        localStorage.setItem(gameUUID + ' team1HasDisc', team1HasDisc);

        $("#team1mode").html("Defense");
        $("#team2mode").html("Offense");
        changeTeamColour(team1HasDisc);

        tableData.push("<tr><td colspan='5' class='half'>HALF</td></tr>");
        $("#pointByPoint").append("<tr><td colspan='5' class='half'>HALF</td></tr>");

        localStorage.setItem(gameUUID + ' details', $("body").html());

        $("#halftime").attr("disabled", true);

        inputs.push("half");
        $("#undo").attr("disabled", false);
        localStorage.setItem(gameUUID + ' inputs', JSON.stringify(inputs));
    });

    $("#undo").click(function() {
        switch (inputs[inputs.length - 1]) {
            case "turnover":
                undoTurnover();
                break;
            case "score":
                undoScore();
                break;
            case "half":
                undoHalf();
                break;
        }

        changeTeamColour(team1HasDisc);
        updateTable();
        inputs.pop();
        if (inputs.length === 0) {
            $("#undo").attr("disabled", true);
        }
        
        localStorage.setItem($("#gameTitle").html() + ' inputs', JSON.stringify(inputs));
        localStorage.setItem($("#gameTitle").html() + ' details', $("body").html());
    });

    function changeTeamColour(team1hasdisc) {
        if (team1hasdisc) {
            $("#team1name").css("color", "yellow");
            $("#team2name").css("color", "white");
        } else {
            $("#team1name").css("color", "white");
            $("#team2name").css("color", "yellow");
        }
    }

    function resetTurnovers() {
        var gameUUID = $("#gameTitle").html();
        team1Turns = 0;
        team2Turns = 0;
        $("#turnover").html("Turnover");
        localStorage.setItem(gameUUID + ' team1Turns', team1Turns);
        localStorage.setItem(gameUUID + ' team2Turns', team2Turns);
    }

    function undoTurnover() {
        var gameUUID = $("#gameTitle").html();
        team1HasDisc ? (team2Turns -= 1) : (team1Turns -= 1);
        team1HasDisc = !team1HasDisc;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);

        localStorage.setItem(gameUUID + ' team1HasDisc', team1HasDisc);
        localStorage.setItem(gameUUID + ' team1Turns', team1Turns);
        localStorage.setItem(gameUUID + ' team2Turns', team2Turns);
    }

    function undoScore() {
        var gameUUID = $("#gameTitle").html();
        team1HasDisc = !team1HasDisc;

        localStorage.setItem($("#gameTitle").html() + ' team1HasDisc', team1HasDisc);

        scoretable[scoretable.length - 1].Team1Scored ? (team1Goals -= 1) : (team2Goals -= 1);
        $("#team1score").html(team1Goals);
        $("#team2score").html(team2Goals);

        localStorage.setItem(gameUUID + ' team1Goals', team1Goals);
        localStorage.setItem(gameUUID + ' team2Goals', team2Goals);

        team1Turns = scoretable[scoretable.length - 1].Team1Turns;
        team2Turns = scoretable[scoretable.length - 1].Team2Turns;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);

        localStorage.setItem(gameUUID + ' team1Turns', team1Turns);
        localStorage.setItem(gameUUID + ' team2Turns', team2Turns);


        if (scoretable.length > 1) {
            if (scoretable[scoretable.length - 1].Team1Side == "O") {
                team1Offense = true;
                $("#team1mode").html("Offense");
                $("#team2mode").html("Defense");
            } else {
                team1Offense = false;
                $("#team1mode").html("Defense");
                $("#team2mode").html("Offense");
            }
        } else {
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
            team1Offense = true;
        }

        localStorage.setItem(gameUUID + ' team1Offense', team1Offense);

        team1ScoredLast.pop();
        localStorage.setItem(gameUUID + ' team1ScoredLast', JSON.stringify(team1ScoredLast));

        scoretable.pop();
        localStorage.setItem(gameUUID + ' scoretable', JSON.stringify(scoretable));

        tableData.pop();
        $("#pointByPoint").find('tr').last().remove('tr');
        if (tableData.length == 1) {
            $("#halftime").attr("disabled", true);
        }
    }

    function undoHalf() {
        var gameUUID = $("#gameTitle").html();
        firstHalf = true;

        localStorage.setItem(gameUUID + ' firstHalf', firstHalf);

        if (scoretable[scoretable.length - 1].Team1Scored) {
            team1Offense = false;
            team1HasDisc = false;
            $("#team1mode").html("Defense");
            $("#team2mode").html("Offense");
        } else {
            team1Offense = true;
            team1HasDisc = true;
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
        }

        localStorage.setItem(gameUUID + ' team1Offense', team1Offense);
        localStorage.setItem(gameUUID + ' team1HasDisc', team1HasDisc);

        tableData.pop();
        $("#pointByPoint").find('tr').last().remove('tr');
        $("#halftime").attr("disabled", false);
    }

    function updateTable() {
        computeResults();

        $("#ppO1").html(team1Results.PointsPlayed[0]);
        $("#ppD1").html(team1Results.PointsPlayed[1]);
        $("#ppO2").html(team2Results.PointsPlayed[0]);
        $("#ppD2").html(team2Results.PointsPlayed[1]);

        $("#gsO1").html(team1Results.GoalsScored[0]);
        $("#gsD1").html(team1Results.GoalsScored[1]);
        $("#gsO2").html(team2Results.GoalsScored[0]);
        $("#gsD2").html(team2Results.GoalsScored[1]);

        $("#toO1").html(team1Results.Turnovers[0]);
        $("#toD1").html(team1Results.Turnovers[1]);
        $("#toO2").html(team2Results.Turnovers[0]);
        $("#toD2").html(team2Results.Turnovers[1]);

        $("#blO1").html(team1Results.Blocks[0]);
        $("#blD1").html(team1Results.Blocks[1]);
        $("#blO2").html(team2Results.Blocks[0]);
        $("#blD2").html(team2Results.Blocks[1]);

        $("#brO1").html(team1Results.Breaks[0]);
        $("#brD1").html(team1Results.Breaks[1]);
        $("#brO2").html(team2Results.Breaks[0]);
        $("#brD2").html(team2Results.Breaks[1]);

        $("#ntO1").html(team1Results.NoTurnGoals[0]);
        $("#ntD1").html(team1Results.NoTurnGoals[1]);
        $("#ntO2").html(team2Results.NoTurnGoals[0]);
        $("#ntD2").html(team2Results.NoTurnGoals[1]);

        $("#gtO1").html(team1Results.GoalsWithTurns[0]);
        $("#gtD1").html(team1Results.GoalsWithTurns[1]);
        $("#gtO2").html(team2Results.GoalsWithTurns[0]);
        $("#gtD2").html(team2Results.GoalsWithTurns[1]);

        $("#hdO1").html(team1Results.HadDiscPoints[0]);
        $("#hdD1").html(team1Results.HadDiscPoints[1]);
        $("#hdO2").html(team2Results.HadDiscPoints[0]);
        $("#hdD2").html(team2Results.HadDiscPoints[1]);

        $("#crO1").html(team1Results.ConversionRate[0] + "%");
        $("#crD1").html(team1Results.ConversionRate[1] + "%");
        $("#crO2").html(team2Results.ConversionRate[0] + "%");
        $("#crD2").html(team2Results.ConversionRate[1] + "%");

        $("#pcO1").html(team1Results.PerfectConversionRate[0] + "%");
        $("#pcD1").html(team1Results.PerfectConversionRate[1] + "%");
        $("#pcO2").html(team2Results.PerfectConversionRate[0] + "%");
        $("#pcD2").html(team2Results.PerfectConversionRate[1] + "%");

        $("#mtO1").html(team1Results.MeanTurnsPerPoint[0]);
        $("#mtD1").html(team1Results.MeanTurnsPerPoint[1]);
        $("#mtO2").html(team2Results.MeanTurnsPerPoint[0]);
        $("#mtD2").html(team2Results.MeanTurnsPerPoint[1]);

        $("#rrO1").html(team1Results.RecoveryRate[0] + "%");
        $("#rrD1").html(team1Results.RecoveryRate[1] + "%");
        $("#rrO2").html(team2Results.RecoveryRate[0] + "%");
        $("#rrD2").html(team2Results.RecoveryRate[1] + "%");

        $("#ds1").html(team1Results.DefensiveSuccessRate + "%");
        $("#ds2").html(team2Results.DefensiveSuccessRate + "%");
    }

    function computeResults() {
        team1Results = new Results();
        team2Results = new Results();

        for (let x = 0; x < scoretable.length; x++) {
            if (scoretable[x].Team1Side == "O") {
                team1Results.PointsPlayed[0] += 1;
                (scoretable[x].Team1Scored) ? team1Results.GoalsScored[0] += 1 : team2Results.GoalsScored[1] += 1;
                team1Results.Turnovers[0] += scoretable[x].Team1Turns;
                team2Results.Turnovers[1] += scoretable[x].Team2Turns;

                if (scoretable[x].Team1Turns > 0) {
                    team2Results.HadDiscPoints[1] += 1;
                }
            } else {
                team1Results.PointsPlayed[1] += 1;
                (scoretable[x].Team1Scored) ? team1Results.GoalsScored[1] += 1 : team2Results.GoalsScored[0] += 1;
                team1Results.Turnovers[1] += scoretable[x].Team1Turns;
                team2Results.Turnovers[0] += scoretable[x].Team2Turns;

                if (scoretable[x].Team2Turns > 0) {
                    team1Results.HadDiscPoints[1] += 1;
                }
            }

            if (scoretable[x].Team1Scored) {
                if (scoretable[x].Team1Turns == 0) {
                    (scoretable[x].Team1Side == "O") ? team1Results.NoTurnGoals[0] += 1 : team1Results.NoTurnGoals[1] += 1;
                }
            } else {
                if (scoretable[x].Team2Turns == 0) {
                    (scoretable[x].Team2Side == "O") ? team2Results.NoTurnGoals[0] += 1 : team2Results.NoTurnGoals[1] += 1;
                }
            }
        }

        team2Results.PointsPlayed[0] = team1Results.PointsPlayed[1];
        team2Results.PointsPlayed[1] = team1Results.PointsPlayed[0];

        team1Results.Blocks[0] = team2Results.Turnovers[1];
        team1Results.Blocks[1] = team2Results.Turnovers[0];
        team2Results.Blocks[0] = team1Results.Turnovers[1];
        team2Results.Blocks[1] = team1Results.Turnovers[0];

        team1Results.Breaks[0] = -1 * team2Results.GoalsScored[1];
        team1Results.Breaks[1] = team1Results.GoalsScored[1];
        team2Results.Breaks[0] = -1 * team1Results.GoalsScored[1];
        team2Results.Breaks[1] = team2Results.GoalsScored[1];

        team1Results.GoalsWithTurns[0] = team1Results.GoalsScored[0] - team1Results.NoTurnGoals[0];
        team1Results.GoalsWithTurns[1] = team1Results.GoalsScored[1] - team1Results.NoTurnGoals[1];
        team2Results.GoalsWithTurns[0] = team2Results.GoalsScored[0] - team2Results.NoTurnGoals[0];
        team2Results.GoalsWithTurns[1] = team2Results.GoalsScored[1] - team2Results.NoTurnGoals[1];

        team1Results.HadDiscPoints[0] = team1Results.PointsPlayed[0];
        team2Results.HadDiscPoints[0] = team2Results.PointsPlayed[0];

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.ConversionRate[0] = Math.round(100 * team1Results.GoalsScored[0] / team1Results.HadDiscPoints[0]);
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.ConversionRate[1] = Math.round(100 * team1Results.GoalsScored[1] / team1Results.HadDiscPoints[1]);
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.ConversionRate[0] = Math.round(100 * team2Results.GoalsScored[0] / team2Results.HadDiscPoints[0]);
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.ConversionRate[1] = Math.round(100 * team2Results.GoalsScored[1] / team2Results.HadDiscPoints[1]);
        }

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.PerfectConversionRate[0] = Math.round(100 * team1Results.NoTurnGoals[0] / team1Results.HadDiscPoints[0]);
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.PerfectConversionRate[1] = Math.round(100 * team1Results.NoTurnGoals[1] / team1Results.HadDiscPoints[1]);
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.PerfectConversionRate[0] = Math.round(100 * team2Results.NoTurnGoals[0] / team2Results.HadDiscPoints[0]);
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.PerfectConversionRate[1] = Math.round(100 * team2Results.NoTurnGoals[1] / team2Results.HadDiscPoints[1]);
        }

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.MeanTurnsPerPoint[0] = Math.round(100 * team1Results.Turnovers[0] / team1Results.HadDiscPoints[0]) / 100;
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.MeanTurnsPerPoint[1] = Math.round(100 * team1Results.Turnovers[1] / team1Results.HadDiscPoints[1]) / 100;
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.MeanTurnsPerPoint[0] = Math.round(100 * team2Results.Turnovers[0] / team2Results.HadDiscPoints[0]) / 100;
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.MeanTurnsPerPoint[1] = Math.round(100 * team2Results.Turnovers[1] / team2Results.HadDiscPoints[1]) / 100;
        }

        if (team1Results.HadDiscPoints[0] - team1Results.NoTurnGoals[0] > 0) {
            team1Results.RecoveryRate[0] = Math.round(100 * team1Results.GoalsWithTurns[0] / (team1Results.HadDiscPoints[0] - team1Results.NoTurnGoals[0]));
        }
        if (team1Results.HadDiscPoints[1] - team1Results.NoTurnGoals[1] > 0) {
            team1Results.RecoveryRate[1] = Math.round(100 * team1Results.GoalsWithTurns[1] / (team1Results.HadDiscPoints[1] - team1Results.NoTurnGoals[1]));
        }
        if (team2Results.HadDiscPoints[0] - team2Results.NoTurnGoals[0] > 0) {
            team2Results.RecoveryRate[0] = Math.round(100 * team2Results.GoalsWithTurns[0] / (team2Results.HadDiscPoints[0] - team2Results.NoTurnGoals[0]));
        }
        if (team2Results.HadDiscPoints[1] - team2Results.NoTurnGoals[1] > 0) {
            team2Results.RecoveryRate[1] = Math.round(100 * team2Results.GoalsWithTurns[1] / (team2Results.HadDiscPoints[1] - team2Results.NoTurnGoals[1]));
        }

        if (team1Results.PointsPlayed[1] > 0) {
            team1Results.DefensiveSuccessRate = Math.round(100 * team1Results.HadDiscPoints[1] / team1Results.PointsPlayed[1]);
        }
        if (team2Results.PointsPlayed[1] > 0) {
            team2Results.DefensiveSuccessRate = Math.round(100 * team2Results.HadDiscPoints[1] / team2Results.PointsPlayed[1]);
        }

    }
});
