chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
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
      var title = encodeURI( document.body.querySelector('.title_wrapper h1').textContent );

      // get the type of video
      var ogType = document.querySelector('meta[property="og:type"').getAttribute('content');
      var type = ogType.slice(6);

      // form tv episode torrent naming convention
      if (type === 'episode') {
        var show = document.body.querySelector('.titleParent a').textContent;
        var seasonEpisode = document.body.querySelector('.bp_heading').textContent.split(' ');
        var season = seasonEpisode[1];
        var episode = seasonEpisode.reverse()[0];

        // correct the S00E00 syntax
        if (season < 10) {
          season = '0' + season;
        }
        if (episode < 10) {
          episode = '0' + episode;
        }

        title = encodeURI( show + ' S' + season + 'E' + episode ); // whoop!
      }

      // what were searching for
      var searchTerm = title;

      // open a new Http Request
      var request = new XMLHttpRequest();
      request.open('GET', 'https://thepiratebay.org/search/' + searchTerm, true);

      // do this when the request returns
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var container = document.implementation.createHTMLDocument('');
          container.open();
          container.write(request.responseText);
          container.close();

          var searchResult = container.getElementById('searchResult');

          if (searchResult) { // stuff!

            // edit the table headings
            searchResult.querySelector('th:first-of-type').innerHTML = 'Type';
            searchResult.querySelector('.sortby').innerHTML = 'Name';
            searchResult.querySelector('.viewswitch').remove();
            searchResult.querySelector('abbr[title="Seeders"]').innerHTML = 'Seed';
            searchResult.querySelector('abbr[title="Leechers"]').innerHTML = 'Leech';

            // keep only the top 10
            var rows = searchResult.querySelectorAll('tbody tr');


            for (i = 0; i < rows.length; i++) {
              if (i > 9) {
                rows[i].parentNode.removeChild(rows[i]);
              } else {
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

            var th = searchResult.querySelectorAll('th');

            for (i = 0; i < th.length; i++) {
              th[i].style.paddingBottom = '10px';
              th[i].style.fontSize = '.9em';
            }

            var td = searchResult.querySelectorAll('td');

            for (i = 0; i < td.length; i++) {
              td[i].style.padding = '8px 4px 10px';
            }
  

            impbContent.innerHTML = searchResult.outerHTML;

          } else { // no stuff :(

            console.log('no stuff');
            impbContent.innerHTML = 'No hits';

          } 
        } else {
          // We reached our target server, but it returned an error
          console.log('Server returned error');
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        console.log('Error connecting to server');
      };

      request.send();

    }
  }, 10);
});