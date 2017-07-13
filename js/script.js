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

    //var gameUUIDs = JSON.parse(localStorage.getItem("gameUUIDs"));

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
    });

    $("#team1name").blur(function() {
        $(".team1").html($("#team1name").html());
        $("#title").html($("#gameTitle").html() + ": " + $("#team1name").html() + " vs " + $("#team2name").html());
        var gameUUID = $('#gameTitle').html();
        localStorage.setItem(gameUUID + ' team1name', $(this).html());
    });

    $("#team2name").blur(function() {
        $(".team2").html($("#team2name").html());
        $("#title").html($("#gameTitle").html() + ": " + $("#team1name").html() + " vs " + $("#team2name").html());
        var gameUUID = $('#gameTitle').html();
        localStorage.setItem(gameUUID + ' team2name', $(this).html());
    });

    $("#turnover").click(function() {
        if (team1HasDisc) {
            team1Turns += 1;
            changeTeamColour(false);
        } else {
            team2Turns += 1;
            changeTeamColour(true);
        }
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
        team1HasDisc = !team1HasDisc;

        inputs.push("turnover");
        $("#halftime").attr("disabled", true);
        $("#undo").attr("disabled", false);
    });

    $("#score").click(function() {
        var team1scored;
        var team1Side;
        var team2Side;
        var team1Class = "";
        var team2Class = "";

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
            localStorage.setItem($('#gameTitle').html() + ' team1score', $("#team1score").html());
            $("#team1mode").html("Defense");
            $("#team2mode").html("Offense");
            team1ScoredLast.push(true);

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
        } else {
            team1scored = false;
            team2Goals += 1;
            $("#team2score").html(team2Goals);
            localStorage.setItem($('#gameTitle').html() + ' team2score', $("#team2score").html());
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
            team1ScoredLast.push(false);

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
        }

        var entry = new ScoreEntry(team1Turns, team1Side, team1Goals, team2Turns, team2Side, team2Goals, team1scored);
        scoretable.push(entry);


        var newRow = "<tr><td class='" + team1Class + "'>" + entry.Team1Turns + "</td><td class='" + team1Class + "'>" + entry.Team1Side + "</td><td>" + entry.Team1Score + "-" + entry.Team2Score + "</td><td class='" + team2Class + "'>" + entry.Team2Side + "</td><td class='" + team2Class + "'>" + entry.Team2Turns + "</td></tr>";
        tableData.push(newRow);
        $("#data").html(tableData.join(""));

        team1HasDisc = !team1HasDisc;
        changeTeamColour(team1HasDisc);
        resetTurnovers();

        firstHalf ? $("#halftime").attr("disabled", false) : $("#halftime").attr("disabled", true);

        updateTable();
        inputs.push("score");
        $("#undo").attr("disabled", false);
    });

    $("#halftime").click(function() {
        firstHalf = false;
        team1Offense = false;
        team1HasDisc = false;

        $("#team1mode").html("Defense");
        $("#team2mode").html("Offense");
        changeTeamColour(team1HasDisc);

        tableData.push("<tr><td colspan='5' class='half'>HALF</td></tr>");
        $("#data").html(tableData.join(""));

        $("#halftime").attr("disabled", true);

        inputs.push("half");
        $("#undo").attr("disabled", false);
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
        team1Turns = 0;
        team2Turns = 0;
        $("#turnover").html("Turnover");
    }

    function undoTurnover() {
        team1HasDisc ? (team2Turns -= 1) : (team1Turns -= 1);
        team1HasDisc = !team1HasDisc;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
    }

    function undoScore() {
        team1HasDisc = !team1HasDisc;

        scoretable[scoretable.length - 1].Team1Scored ? (team1Goals -= 1) : (team2Goals -= 1);
        $("#team1score").html(team1Goals);
        $("#team2score").html(team2Goals);

        team1Turns = scoretable[scoretable.length - 1].Team1Turns;
        team2Turns = scoretable[scoretable.length - 1].Team2Turns;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);

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

        team1ScoredLast.pop();
        scoretable.pop();
        tableData.pop();
        $("#data").html(tableData.join(""));
        if (tableData.length == 1) {
            $("#halftime").attr("disabled", true);
        }
    }

    function undoHalf() {
        firstHalf = true;

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

        tableData.pop();
        $("#data").html(tableData.join(""));
        $("#halftime").attr("disabled", false);
    }

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

        $('#turnover, #score').prop("disabled", true);

        // Game Name
        $("#gameTitle").html(gameUUID);

        // Team Names
        $('#team1name, .team1').html(localStorage.getItem(gameUUID + ' team1name'));
        $('#team2name, .team2').html(localStorage.getItem(gameUUID + ' team2name'));

        // Score
        $('#team1score').html(localStorage.getItem(gameUUID + ' team1score'));
        $('#team2score').html(localStorage.getItem(gameUUID + ' team2score'));

        // Points Played
        $("#ppO1").html(localStorage.getItem(gameUUID + ' team1OffencePointsPlayed'));
        $("#ppD1").html(localStorage.getItem(gameUUID + ' team1DefencePointsPlayed'));
        $("#ppO2").html(localStorage.getItem(gameUUID + ' team2OffencePointsPlayed'));
        $("#ppD2").html(localStorage.getItem(gameUUID + ' team2DefencePointsPlayed'));

        // Goals Scored
        $("#gsO1").html(localStorage.getItem(gameUUID + ' team1OffenceGoalsScored'));
        $("#gsD1").html(localStorage.getItem(gameUUID + ' team1DefenceGoalsScored'));
        $("#gsO2").html(localStorage.getItem(gameUUID + ' team2OffenceGoalsScored'));
        $("#gsD2").html(localStorage.getItem(gameUUID + ' team2DefenceGoalsScored'));

        // Turnovers
        $("#toO1").html(localStorage.getItem(gameUUID + ' team1OffenceTurnovers'));
        $("#toD1").html(localStorage.getItem(gameUUID + ' team1DefenceTurnovers'));
        $("#toO2").html(localStorage.getItem(gameUUID + ' team2OffenceTurnovers'));
        $("#toD2").html(localStorage.getItem(gameUUID + ' team2DefenceTurnovers'));

        // Blocks
        $("#blO1").html(localStorage.getItem(gameUUID + ' team1OffenceBlocks'));
        $("#blD1").html(localStorage.getItem(gameUUID + ' team1DefenceBlocks'));
        $("#blO2").html(localStorage.getItem(gameUUID + ' team2OffenceBlocks'));
        $("#blD2").html(localStorage.getItem(gameUUID + ' team2DefenceBlocks'));

        // Breaks
        $("#brO1").html(localStorage.getItem(gameUUID + ' team1OffenceBreaks'));
        $("#brD1").html(localStorage.getItem(gameUUID + ' team1DefenceBreaks'));
        $("#brO2").html(localStorage.getItem(gameUUID + ' team2OffenceBreaks'));
        $("#brD2").html(localStorage.getItem(gameUUID + ' team2DefenceBreaks'));

        // No Turn Goals
        $("#ntO1").html(localStorage.getItem(gameUUID + ' team1OffenceNoTurnGoals'));
        $("#ntD1").html(localStorage.getItem(gameUUID + ' team1DefenceNoTurnGoals'));
        $("#ntO2").html(localStorage.getItem(gameUUID + ' team2OffenceNoTurnGoals'));
        $("#ntD2").html(localStorage.getItem(gameUUID + ' team2DefenceNoTurnGoals'));

        // Goals With Turns
        $("#gtO1").html(localStorage.getItem(gameUUID + ' team1OffenceGoalsWithTurns'));
        $("#gtD1").html(localStorage.getItem(gameUUID + ' team1DefenceGoalsWithTurns'));
        $("#gtO2").html(localStorage.getItem(gameUUID + ' team2OffenceGoalsWithTurns'));
        $("#gtD2").html(localStorage.getItem(gameUUID + ' team2DefenceGoalsWithTurns'));

        // Had Disc Points
        $("#hdO1").html(localStorage.getItem(gameUUID + ' team1OffenceHadDiscPoints'));
        $("#hdD1").html(localStorage.getItem(gameUUID + ' team1DefenceHadDiscPoints'));
        $("#hdO2").html(localStorage.getItem(gameUUID + ' team2OffenceHadDiscPoints'));
        $("#hdD2").html(localStorage.getItem(gameUUID + ' team2DefenceHadDiscPoints'));

        // Conversion Rate
        $("#crO1").html(localStorage.getItem(gameUUID + ' team1OffenceConversionRate'));
        $("#crD1").html(localStorage.getItem(gameUUID + ' team1DefenceConversionRate'));
        $("#crO2").html(localStorage.getItem(gameUUID + ' team2OffenceConversionRate'));
        $("#crD2").html(localStorage.getItem(gameUUID + ' team2DefenceConversionRate'));

        // Perfect Conversin Rate
        $("#pcO1").html(localStorage.getItem(gameUUID + ' team1OffencePerfectConversionRate'));
        $("#pcD1").html(localStorage.getItem(gameUUID + ' team1DefencePerfectConversionRate'));
        $("#pcO2").html(localStorage.getItem(gameUUID + ' team2OffencePerfectConversionRate'));
        $("#pcD2").html(localStorage.getItem(gameUUID + ' team2DefencePerfectConversionRate'));

        // Mean Turns Per Point
        $("#mtO1").html(localStorage.getItem(gameUUID + ' team1OffenceMeanTurnsPerPoint'));
        $("#mtD1").html(localStorage.getItem(gameUUID + ' team1DefenceMeanTurnsPerPoint'));
        $("#mtO2").html(localStorage.getItem(gameUUID + ' team2OffenceMeanTurnsPerPoint'));
        $("#mtD2").html(localStorage.getItem(gameUUID + ' team2DefenceMeanTurnsPerPoint'));                

        // Recovery Rate
        $("#rrO1").html(localStorage.getItem(gameUUID + ' team1OffenceRecoveryRate'));
        $("#rrD1").html(localStorage.getItem(gameUUID + ' team1DefenceRecoveryRate'));
        $("#rrO2").html(localStorage.getItem(gameUUID + ' team2OffenceRecoveryRate'));
        $("#rrD2").html(localStorage.getItem(gameUUID + ' team2DefenceRecoveryRate'));

        // Defensive Success Rate
        $("#ds1").html(localStorage.getItem(gameUUID + ' team1DefenceDefensiveSuccessRate'));
        $("#ds2").html(localStorage.getItem(gameUUID + ' team2DefenceDefensiveSuccessRate'));

    }



    function updateTable() {
        
        var gameUUID = $('#gameTitle').html();

        computeResults();

        // Points Played
        $("#ppO1").html(team1Results.PointsPlayed[0]);
        $("#ppD1").html(team1Results.PointsPlayed[1]);
        $("#ppO2").html(team2Results.PointsPlayed[0]);
        $("#ppD2").html(team2Results.PointsPlayed[1]);

        localStorage.setItem(gameUUID + ' team1OffencePointsPlayed', $("#ppO1").html());
        localStorage.setItem(gameUUID + ' team1DefencePointsPlayed', $("#ppD1").html());
        localStorage.setItem(gameUUID + ' team2OffencePointsPlayed', $("#ppO2").html());
        localStorage.setItem(gameUUID + ' team2DefencePointsPlayed', $("#ppD2").html());

        // Goals Scored
        $("#gsO1").html(team1Results.GoalsScored[0]);
        $("#gsD1").html(team1Results.GoalsScored[1]);
        $("#gsO2").html(team2Results.GoalsScored[0]);
        $("#gsD2").html(team2Results.GoalsScored[1]);

        localStorage.setItem(gameUUID + ' team1OffenceGoalsScored', $("#gsO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceGoalsScored', $("#gsD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceGoalsScored', $("#gsO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceGoalsScored', $("#gsD2").html());

        // Turnovers
        $("#toO1").html(team1Results.Turnovers[0]);
        $("#toD1").html(team1Results.Turnovers[1]);
        $("#toO2").html(team2Results.Turnovers[0]);
        $("#toD2").html(team2Results.Turnovers[1]);

        localStorage.setItem(gameUUID + ' team1OffenceTurnovers', $("#toO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceTurnovers', $("#toD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceTurnovers', $("#toO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceTurnovers', $("#toD2").html());        

        // Blocks
        $("#blO1").html(team1Results.Blocks[0]);
        $("#blD1").html(team1Results.Blocks[1]);
        $("#blO2").html(team2Results.Blocks[0]);
        $("#blD2").html(team2Results.Blocks[1]);

        localStorage.setItem(gameUUID + ' team1OffenceBlocks', $("#blO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceBlocks', $("#blD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceBlocks', $("#blO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceBlocks', $("#blD2").html());        

        // Breaks
        $("#brO1").html(team1Results.Breaks[0]);
        $("#brD1").html(team1Results.Breaks[1]);
        $("#brO2").html(team2Results.Breaks[0]);
        $("#brD2").html(team2Results.Breaks[1]);

        localStorage.setItem(gameUUID + ' team1OffenceBreaks', $("#brO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceBreaks', $("#brD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceBreaks', $("#brO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceBreaks', $("#brD2").html());

        // No Turn Goals
        $("#ntO1").html(team1Results.NoTurnGoals[0]);
        $("#ntD1").html(team1Results.NoTurnGoals[1]);
        $("#ntO2").html(team2Results.NoTurnGoals[0]);
        $("#ntD2").html(team2Results.NoTurnGoals[1]);

        localStorage.setItem(gameUUID + ' team1OffenceNoTurnGoals', $("#ntO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceNoTurnGoals', $("#ntD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceNoTurnGoals', $("#ntO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceNoTurnGoals', $("#ntD2").html());        

        // Goals With Turns
        $("#gtO1").html(team1Results.GoalsWithTurns[0]);
        $("#gtD1").html(team1Results.GoalsWithTurns[1]);
        $("#gtO2").html(team2Results.GoalsWithTurns[0]);
        $("#gtD2").html(team2Results.GoalsWithTurns[1]);

        localStorage.setItem(gameUUID + ' team1OffenceGoalsWithTurns', $("#gtO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceGoalsWithTurns', $("#gtD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceGoalsWithTurns', $("#gtO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceGoalsWithTurns', $("#gtD2").html());        

        // Had Disc Points
        $("#hdO1").html(team1Results.HadDiscPoints[0]);
        $("#hdD1").html(team1Results.HadDiscPoints[1]);
        $("#hdO2").html(team2Results.HadDiscPoints[0]);
        $("#hdD2").html(team2Results.HadDiscPoints[1]);

        localStorage.setItem(gameUUID + ' team1OffenceHadDiscPoints', $("#hdO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceHadDiscPoints', $("#hdD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceHadDiscPoints', $("#hdO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceHadDiscPoints', $("#hdD2").html());        

        // Conversion Rate
        $("#crO1").html(team1Results.ConversionRate[0] + "%");
        $("#crD1").html(team1Results.ConversionRate[1] + "%");
        $("#crO2").html(team2Results.ConversionRate[0] + "%");
        $("#crD2").html(team2Results.ConversionRate[1] + "%");

        localStorage.setItem(gameUUID + ' team1OffenceConversionRate', $("#crO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceConversionRate', $("#crD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceConversionRate', $("#crO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceConversionRate', $("#crD2").html());        

        // Perfect Conversin Rate
        $("#pcO1").html(team1Results.PerfectConversionRate[0] + "%");
        $("#pcD1").html(team1Results.PerfectConversionRate[1] + "%");
        $("#pcO2").html(team2Results.PerfectConversionRate[0] + "%");
        $("#pcD2").html(team2Results.PerfectConversionRate[1] + "%");

        localStorage.setItem(gameUUID + ' team1OffencePerfectConversionRate', $("#pcO1").html());
        localStorage.setItem(gameUUID + ' team1DefencePerfectConversionRate', $("#pcD1").html());
        localStorage.setItem(gameUUID + ' team2OffencePerfectConversionRate', $("#pcO2").html());
        localStorage.setItem(gameUUID + ' team2DefencePerfectConversionRate', $("#pcD2").html());        

        // Mean Turns Per Point
        $("#mtO1").html(team1Results.MeanTurnsPerPoint[0]);
        $("#mtD1").html(team1Results.MeanTurnsPerPoint[1]);
        $("#mtO2").html(team2Results.MeanTurnsPerPoint[0]);
        $("#mtD2").html(team2Results.MeanTurnsPerPoint[1]);

        localStorage.setItem(gameUUID + ' team1OffenceMeanTurnsPerPoint', $("#mtO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceMeanTurnsPerPoint', $("#mtD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceMeanTurnsPerPoint', $("#mtO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceMeanTurnsPerPoint', $("#mtD2").html());        

        // Recovery Rate
        $("#rrO1").html(team1Results.RecoveryRate[0] + "%");
        $("#rrD1").html(team1Results.RecoveryRate[1] + "%");
        $("#rrO2").html(team2Results.RecoveryRate[0] + "%");
        $("#rrD2").html(team2Results.RecoveryRate[1] + "%");

        localStorage.setItem(gameUUID + ' team1OffenceRecoveryRate', $("#rrO1").html());
        localStorage.setItem(gameUUID + ' team1DefenceRecoveryRate', $("#rrD1").html());
        localStorage.setItem(gameUUID + ' team2OffenceRecoveryRate', $("#rrO2").html());
        localStorage.setItem(gameUUID + ' team2DefenceRecoveryRate', $("#rrD2").html());        

        // Defensive Success Rate
        $("#ds1").html(team1Results.DefensiveSuccessRate + "%");
        $("#ds2").html(team2Results.DefensiveSuccessRate + "%");

        localStorage.setItem(gameUUID + ' team1DefenceDefensiveSuccessRate', $("#ds1").html());
        localStorage.setItem(gameUUID + ' team2DefenceDefensiveSuccessRate', $("#ds2").html());       
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
