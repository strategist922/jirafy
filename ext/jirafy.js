function replaceTicketNumbersWithLinks(projectKeys, jiraServer) {
  regexes = []
  for(var c = 0; c < projectKeys.length; c++) {
    regexes[c] = new RegExp("(browse/)?(" + projectKeys[c] + "-[0-9]+)", "g");
  }

  $('*', 'body')
    .andSelf()
    .contents()
    .filter(function() {
      return this.nodeType === 3; // Only text nodes.
    })
    .filter(function() {
      var parentTag = this.parentElement.tagName;
      if (parentTag == 'A' || parentTag == 'TEXTAREA') return false;
      for(var c = 0; c < regexes.length; c++) {
        if (regexes[c].exec(this.nodeValue)) return true;
      }
      return false;
    })
    .replaceWith(function() {
      var newVal = this.nodeValue;
      for(var c = 0; c < regexes.length; c++) {
        newVal = newVal.replace(regexes[c],
                                 function(matched, hasBrowsePrefix, ticket) {
                                   // Only linkify ticket numbers if they are _not_ prefixed with "browse/".  We could
                                   // use a negative lookbehind regex, but javascript doesn't support them
                                   replaceVal = hasBrowsePrefix ?
                                     matched : // This one has a browse prefix: don't replace anything.
                                     "<a href=\"" + jiraServer + "browse/" + ticket + "\">" + ticket + "</a>";
                                   return replaceVal;
                                 }
                               );
      }
      return newVal;
    });
}

function matchesAnyUrlPatterns(url, urls_to_jirafy) {
  urls = urls_to_jirafy.split(",");
  for(var c = 0; c < urls.length; c++) {
    if (url.indexOf(urls[c]) != -1) return true;
  }
  return false;
}

chrome.extension.sendRequest({method: "getSettings"}, function(response) {
  url = new String(window.location);
  if (matchesAnyUrlPatterns(url, response.urls_to_jirafy)) {
    keys = response.project_keys.split(",");
    replaceTicketNumbersWithLinks(keys, response.jira_server);
  }
});
