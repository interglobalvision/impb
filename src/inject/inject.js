chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "interactive") {
      clearInterval(readyStateCheckInterval);

      var impbContainer = document.getElementById('main_bottom');
      var impb = document.createElement('div');

      // make it IMDB style
      impb.id = 'impb';
      impb.style.padding = '20px 21px 24px 20px';

      impbContainer.insertBefore( impb, impbContainer.firstChild );

      // add the heading
      var heading = document.createElement('h3');
      heading.innerHTML = 'Pirate Bay Search Results';
      impb.appendChild( heading );

      // add content wrapper with loading text
      var impbContent = document.createElement('div');
      impbContent.id = 'impb-content';
      impbContent.innerHTML = 'Loading...';
      impb.appendChild( impbContent );

      // get the title
      var title = encodeURI( document.querySelector('meta[property="og:title"').getAttribute('content') );

      // get the type of video
      var ogType = document.querySelector('meta[property="og:type"').getAttribute('content');
      var type = ogType.slice(6);

      // form tv episode torrent naming convention
      if (type === 'episode') {
        // > 'Season 1 | Episode 2'
        var show = document.body.querySelector('.titleParent a').textContent;

        // split string into array at spaces
        // {'Season', '1', '|', 'Episode', '2'}
        var seasonEpisode = document.body.querySelector('.bp_heading').textContent.split(' ');

        // [1] is the season number
        var season = seasonEpisode[1];

        // reverse the array so [0] is the episode number
        var episode = seasonEpisode.reverse()[0];

        // correct the S00 and E00 syntax
        if (season < 10) {
          season = '0' + season;
        }
        if (episode < 10) {
          episode = '0' + episode;
        }

        // put it together
        title = encodeURI( show + ' S' + season + 'E' + episode ); // whoop!
      }

      // title is the search term
      var searchTerm = title;

      // open a new http request
      var request = new XMLHttpRequest();
      // pirate bay search url + search term
      request.open('GET', 'https://thepiratebay.org/search/' + searchTerm + '/0/99/200', true);

      // do this when the request returns
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // reached the pirate bay and got a response

          // make a new document object (dummy DOM)
          var container = document.implementation.createHTMLDocument('');

          // fill the dummy DOM with the response
          container.open();
          container.write(request.responseText);
          container.close();

          if (container.body != null) {

            // get our search result table from the dummy DOM
            var searchResult = container.getElementById('searchResult');

            if (searchResult != null) { // stuff!

              // edit the table headings
              searchResult.querySelector('th:first-of-type').innerHTML = 'Type';
              searchResult.querySelector('.sortby').innerHTML = 'Name';
              searchResult.querySelector('.viewswitch').remove();
              searchResult.querySelector('abbr[title="Seeders"]').innerHTML = 'Seed';
              searchResult.querySelector('abbr[title="Leechers"]').innerHTML = 'Leech';

              // get our rows
              var rows = searchResult.querySelectorAll('tbody tr');

              // iterate over rows
              for (i = 0; i < rows.length; i++) {

                if (i > 9) { // remove all rows over 10

                  rows[i].parentNode.removeChild(rows[i]);

                } else { // add 'odd' and 'even' classes to rows for IMDB table styling

                  if (i % 2) {
                    rows[i].classList.add('even');
                  } else {
                    rows[i].classList.add('odd');
                  }

                }
              }

              // remove 'Type' links
              var types = searchResult.querySelectorAll('td.vertTh a');

              for (i = 0; i < types.length; i++) {
                var typeParent = types[i].parentNode;
                while (types[i].firstChild) typeParent.insertBefore(types[i].firstChild, types[i]);
                typeParent.removeChild(types[i]);
              }

              // add the Pirate Day domain to User links
              var users = searchResult.querySelectorAll('.detName a, td a[href*="/user"]');

              for (i = 0; i < users.length; i++) {
                var oldHref = users[i].getAttribute('href');
                users[i].setAttribute('href', 'https://thepiratebay.org' + oldHref);
              }

              // remove weird streaming torrent spam links
              var bitx = searchResult.querySelectorAll('a[href*="//cdn.bitx.tv"]');

              for (i = 0; i < bitx.length; i++) {
                bitx[i].innerHTML = '';
                bitx[i].parentNode.removeChild(bitx[i]);
              }

              // apply some IMDB table styles
              searchResult.style.borderCollapse = 'collapse';

              // apply padding and fontsize to the table head cells
              var th = searchResult.querySelectorAll('th');

              for (i = 0; i < th.length; i++) {
                th[i].style.paddingBottom = '10px';
                th[i].style.fontSize = '.9em';
              }

              // apply padding to the table body cells
              var td = searchResult.querySelectorAll('td');

              for (i = 0; i < td.length; i++) {
                td[i].style.padding = '8px 4px 10px';
              }

              // replace Loading text with Search results table
              impbContent.innerHTML = searchResult.outerHTML;

            } else { // no stuff :(

              impbContent.innerHTML = '<strong>No hits!</strong>'; // replace Loading text with No Hits

            }

          } else { // no body

          console.log('The Pirate Bay might be down...database maintenance? Wait a moment and <strong>refresh!</strong>');

          impbContent.innerHTML = 'No body! Database maintenance.';

          }

        } else {

          // reached the pirate bay, but it sent back an error!
          console.log('Server returned error');

          impbContent.innerHTML = 'Server error! The Pirate Bay might be down... Wait a moment and <strong>refresh!</strong>';

        }
      };

      request.onerror = function(e) {

        // didn't reach the pirate bay :(
        console.log('Error connecting to server');

        impbContent.innerHTML = 'Error ' + e.target.status;

      };

      request.send();

    }
  }, 10);
});
