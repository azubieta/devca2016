/**
 * Created by alexis on 5/6/16.
 */

var sources = [
    {name: "who", url: "http://www.who.int/feeds/entity/csr/don/en/rss.xml", relevance: 10, area: "world"},
    {name: "who",url: "http://www.who.int/feeds/entity/mediacentre/news/en/rss.xml", relevance: 10, area: "world"},
    {name: "who",url: "http://www.who.int/feeds/entity/emergencies/zika-virus/en/rss.xml", relevance: 10, area: "world"},
    {name: "paho",url: "http://www.paho.org/hq/index.php?format=feed&type=rss&lang=en", relevance: 10, area: "america"},

    {name: "bbc",url: "http://www.bbc.com/mundo/temas/salud/index.xml", relevance: 1, area: "world"},
    {name: "telesur",url: "http://www.telesurtv.net/english/rss/RssLatinoamerica.xml", relevance: 1, area: "world"},
    {name: "healthdata",url: "http://ghdx.healthdata.org/recent/feed", relevance: 1, area: "world"},

    {name: "caribbeanmedicalnews",url: "http://feeds.feedburner.com/caribbeanmedicalnews?format=xml", relevance: 1, area: "caribbean"},

    {name: "caribbeannewsnow",url: "http://www.caribbeannewsnow.com/news/_files/rss/news/Caribbean-News-Now!-Daily-Headlines.xml", relevance: 1, area: "caribbean"},
    {name: "caribbeannewsdigital",url: "http://www.caribbeannewsdigital.com/rss", relevance: 1, area: "caribbean"},
    {name: "caribbeannationalweekly",url: "http://www.caribbeannationalweekly.com/feed/", relevance: 1, area: "caribbean"},


    {name: "cubadebate",url: "http://en.cubadebate.cu/feed/", relevance: 5, area: "Cuba"},
    {name: "granma",url: "http://en.granma.cu/feed", relevance: 5, area: "Cuba"},
    {name: "juventudrebelde",url: "http://english.juventudrebelde.cu/rss/all/", relevance: 5, area: "Cuba"},

    {name: "moh-jm",url: "http://moh.gov.jm/feed/", relevance: 10, area: "Jamaica"},
    {name: "jamaicaobserver",url: "http://www.jamaicaobserver.com/rss/news/", relevance: 5, area: "Jamaica"},
    {name: "jamaica-gleaner",url: "http://www.jamaica-gleaner.com/feed/rss.xml/", relevance: 5, area: "Jamaica"},


    {name: "moh-tt",url: "http://www.health.gov.tt/rss/news/", relevance: 10, area: "Jamaica"},

];

var country_news = {};
// var countries_match = FuzzySet();

google.load("feeds", "1");

function initialize() {
    /*
    for (var i = 0; i < countries.length; i ++) {
        countries_match.add(countries[i].name);
    }*/

    for (var i = 0; i < sources.length; i++) {
        pullRss(sources[i].url, sources[i].relevance);
    }

    //postCountriesInfo();
}

function pullRss(url, relevance) {
    var feed = new google.feeds.Feed(url);
    feed.setNumEntries(40);
    feed.includeHistoricalEntries();
    feed.load(function (result) {
        if (!result.error) {
            for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
                entry['relevance'] = relevance
                //console.log(entry.title)
                if (hasZickaInfo(entry)) {
                    var inv = countMentionedCountries(entry.content);
                    for (var country in inv) {
                        if (country in country_news) {
                            country_news[country].push(entry);
                        } else
                            country_news[country] = [entry];
                    }

                    postEntry(entry);
                    updateCountriesInfo();
                }
            }
        } else
            console.log(result.error)
    });
}

function hasZickaInfo(entry) {
    // console.log(entry.content);
    var res = entry.content.search(/zika/i);
    return res != -1;
}

function countMentionedCountries(text) {
    var inv = {};
    for (var i = 0; i < countries.length; i++) {
        if (text.search(countries[i].name) != -1)
            inv[countries[i].name] = true;
    }
    return inv;
}

function countMentionedCountriesFuzzy(text) {
    var tokens = text.split(/\s+/);
    for (var i = 0; i < countries.length; i++) {
        for (var j = 0; j < tokens.length; j ++) {
            var old_match = [[0,""]];
            var match = [[0,""]];
            var k = 0;
            var needle = "";
            do {
                old_match = match;
                needle += tokens[j + k] + " ";
                match = countries_match.get(needle);
                // console.log(needle);
                // console.log(match);
                if (match == null)
                    break;
                if (match.length <= 0)
                    break;
                if (match[0][0] > 0.9) {
                    j += k;
                    registerCountryMatch(match[0][1]);
                }
                k +=1;
            } while ( (j + k < tokens.length) &&  match[0][0] > old_match[0][0]);
        }
    }
}
function registerCountryMatch(name) {
    console.log("Matched " + name);
    if (name in involved_countries)
        involved_countries[name] += 1;
    else
        involved_countries[name] = 1;
}

function updateCountriesInfo() {

    var container = document.getElementById("nav-mobile");
    container.innerHTML = '';
    for (var country in country_news) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.appendChild(document.createTextNode(country));
        a.href="javascript:postCountryEntries(\""+country+"\");";

        li.appendChild(a);
        container.appendChild(li);

        /*for (var entry in country_news[country])
         div.appendChild(document.createTextNode(country_news[country][entry].title));*/
    }
}

function postCountryEntries(country) {
    var container = document.getElementById("cards-holder");
    container.innerHTML = "";
    //console.log(country_news)
    for (var i = 0; i <  country_news[country].length; i ++) {
        //console.log(country_news[country][i])
        postEntry(country_news[country][i]);
    }
}
function postEntry(entry) {
    var container = document.getElementById("cards-holder");
    var div1 = document.createElement("div");
    //console.log(entry.relevance)
    switch (entry.relevance) {
        case  10:
            div1.className = "card lime darken-4";
            break;
        case  5:
            div1.className = "card brown darken-1";
            break;
        default:
            div1.className = "card blue-grey darken-1";
            break;
    }

    var div2  = document.createElement("div");
    div2.className = "card-content white-text";

    var head = document.createElement("span");
    head.className = "card-title truncate";
    head.appendChild(document.createTextNode(entry.title));
    var body  = document.createElement("p");
    body.className = "giveMeEllipsis";
    body.appendChild(document.createTextNode(entry.content));


    div2.appendChild(head);
    div2.appendChild(body);
    div1.appendChild(div2);

    var divAc  = document.createElement("div");
    divAc.className = "card-action";
    var linkMore  = document.createElement("a");
    linkMore.href = entry.link;
    linkMore.appendChild(document.createTextNode("READ MORE"));
    divAc.appendChild(linkMore);

    div1.appendChild(divAc);
    container.appendChild(div1);
}

google.setOnLoadCallback(initialize);
