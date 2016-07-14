chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      $('#main_bottom').prepend('<div id="impb"></div>'); // make the container element

      // make it IMDB style
      $('#impb').css('padding', '20px 21px 24px 20px')
      .html('<h3>Pirate Bay Search Results</h3><div class="impb-loading">Loading...</div>');

      var title = encodeURI($('.title_wrapper h1').text());

      var ogType = $('meta[property="og:type"').attr('content');
      var type = ogType.slice(6);

      // form tv episode torrent naming convention
      if (type === 'episode') {
        var show = $('.titleParent a').text();
        var seasonEpisode = $('.bp_heading').html().split(' ');
        var season = seasonEpisode[1];
        var episode = seasonEpisode.reverse()[0];

        // correct the S00E00 syntax
        if (season < 10) {
          season = '0' + season;
        }
        if (episode < 10) {
          episode = '0' + episode;
        }

        title = encodeURI(show + ' S' + season + 'E' + episode); // whoop!
      }

      var searchTerm = title;

      $.ajax({
        url: "https://thepiratebay.org/search/" + searchTerm,
        dataType: 'text',
        success: function(data) {
          var $searchResult = $(data).find('#searchResult'); // find the search results table

          if ($searchResult.length) { // stuff!

            // edit the table headings
            $searchResult.find('th:first-of-type').html('Type');
            $searchResult.find('.sortby').html('Name');
            $searchResult.find('.viewswitch').remove();
            $searchResult.find('[title="Seeders"]').html('Seed');
            $searchResult.find('[title="Leechers"]').html('Leech');

            $searchResult.find('tbody tr:gt(9)').remove(); // keep only the top 10

            $searchResult.find('td.vertTh a:link').contents().unwrap(); // remove 'Type' links

            $searchResult.find('.detName a:link, td a[href*="/user"]').attr('href', function(index, src) {
              return 'https://thepiratebay.org' + src;
            }); // add the Pirate Day domain to User links

            $searchResult.find('a[href*="//cdn.bitx.tv"]').remove(); // remove weird streaming torrent spam links

            // apply some IMDB table styles
            $searchResult.css('border-collapse', 'collapse');
            $searchResult.find('th').css({'padding-bottom': '10px', 'font-size': '.9em'});
            $searchResult.find('td').css('padding', '8px 4px 10px');
            $searchResult.find('tbody tr:nth-child(odd)').addClass('odd');
            $searchResult.find('tbody tr:nth-child(even)').addClass('even');

            $('.impb-loading').remove(); // get that loading text outta there
            $('#impb').append($searchResult); // get those results in there

          } else { // no stuff :(
            $('.impb-loading').remove();
            $('#impb').append('No hits');
          } 
        }
      });

    }
  }, 10);
});