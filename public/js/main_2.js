
function updateTable(tweets) {
    var rows = '';
    if (tweets.length > 0) {
        $.each(tweets, function (index, tweet) {
            var row = '<tr>';
            row += '<td>' + tweet.user.name + '</td>';
            row += '<td>' + tweet.user.screen_name + '</td>';
            row += '<td>' + tweet.created_at + '</td>';
            row += '<td>' + tweet.text + '</td>';
            row += '<td>' + tweet.user.location + '</td>';
            rows += row + '<tr>';
        });
        $('#tweets-table tbody').html(rows);
    }
};

function initChart(dataset) {
    var data = dataset;

    var width = 500;
    var height = 350;

    //Adds a linear scale for y axis
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, function (d) { return d; }) + 20]);

    const colors = ["#5CD444", "#FCBC0C", "#EC2434"];
    const keys = ['Positive', 'Neutral', 'Negative'];

    var yAxis = d3.axisLeft()
        .scale(y);

    //Select chart and set its width and height
    var chart = d3.select("svg")
        .attr("width", width)
        .attr("height", height);


    var barWidth = width / data.length;

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(" + i * barWidth + ",0)"; });

    bar.append("rect")
        .attr("y", function (d) { return y(d); })
        .attr("width", barWidth - 15)
        .attr("height", function (d) { return height - y(d); })
        .attr("fill", function (d, i) { return colors[i]; });

    bar.append("text")
        .attr("x", (barWidth - 15) / 2)
        .attr("y", function (d) { return y(d) + 3; })
        .attr("dy", ".75em")
        .text(function (d) { return d; });

    bar.append("text")
        .attr("x", (barWidth - 35) / 2)
        .attr("y", function (d) { return y(d) - 15; })
        .attr("dy", ".75em")
        .text(function (d, i) { return keys[i]; });

    chart.append("g")
        .attr("transform", "translate(0, 400)")
        .call(yAxis);


     
}


$('document').ready(function () {
    setInterval(function () {
        $.ajax({
            "url": '/updateData',
            "success": function (data) {
                updateTable(data.tweets);
                $('svg').remove();
                $('.data').append('<svg></svg>');
                initChart(Object.values(data.sentiments));
            },
            "error": function (error) {
            }
        })
    }, 1 * 3000);
});



   
  
  
