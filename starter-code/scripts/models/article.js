function Article (opts) {
  for (keys in opts) {
    this[keys] = opts[keys];
  }
}

/* DONE: Instead of a global `articles = []` array, let's track this list of all
 articles directly on the constructor function. Note: it is NOT on the prototype.
 In JavaScript, functions are themselves objects, which means we can add
 properties/values to them at any time. In this case, we have a key:value pair
 to track, that relates to ALL of the Article objects, so it does not belong on
 the prototype, as that would only be relevant to a single instantiated Article.
 */

Article.all = [];

Article.prototype.toHtml = function(scriptTemplateId) {
  var template = Handlebars.compile($(scriptTemplateId).text());
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);
  return template(this);
};

/* NOTE: There are some other functions that also relate to all articles,
 rather than just single instances. Object-oriented programming would
 call these "class-level" functions, that are relevant to the entire "class"
 of objects that are Articles, rather than just one instance. */

/* DONE: Refactor this code into a function for greater control.
    It will take in our data, and process it via the Article constructor: */

Article.loadAll = function(dataWePassIn) {
  dataWePassIn.sort(function(a, b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  }).forEach(function(element) {
    Article.all.push(new Article(element));
  });
};

/* This function below will retrieve the data from either a local or remote
 source, process it, then hand off control to the View: */

Article.fetchAll = function() {
  if(localStorage.hackerIpsum) {
    /* When our data is already in localStorage:
    1. Process it (sort and instantiate),
    2. Render the index page. */
    /* Article.loadAll(TODO: Invoke with our localStorage!) Should we parse or stringify this?
    // TODO: Now let's render the index page. */
  } else {
    /* TODO: Otherwise, without localStorage data, we need to:
      Retrieve our JSON file asynchronously
       (which jQuery method is best for this?)
      Within this method, we should:
      1. Load our JSON data,
      2. Store that data in localStorage, so we can skip the server call next time.
      3. And then render the index page. */
  }

};

Article.fetchAll = function() {
  if (localStorage.hackerIpsum) {
    var retrievedData = JSON.parse(localStorage.hackerIpsum);
    Article.loadAll(retrievedData);
    articleView.renderIndexPage();
  } else {
    $.getJSON('../data/hackerIpsum.json',function(data){
      localStorage.hackerIpsum = JSON.stringify(data);
      Article.loadAll(data);
      articleView.renderIndexPage();
    });
  }
};

/* Great work so far! STRETCH GOAL TIME!? Refactor your fetchAll above, or
   get some additional typing practice here. Our main goal in this part of the
   lab will be saving the eTag located in Headers, to see if it's been updated!
*/

Article.fetchAll = function() {
  if (localStorage.hackerIpsum) {
    $.ajax({
      url: '../data/hackerIpsum.json',
      method: 'HEAD',
      success: function(data,msg,xhr) {
        var eTag = xhr.getResponseHeader('ETag');
        if(!localStorage.eTag || eTag !== localStorage.eTag) {
          Article.getAll();
        } else {
          article.loadAll(JSON.parse(localStorage.hackerIpsum));
          articleView.renderIndexPage();
        }
      }
    });
  } else {
    Article.getAll();
  }
};

Article.getAll = function () {
  $.getJSON('../data/hackerIpsum.json',function(data, msg, xhr) {
    localStorage.hackerIpsum = JSON.stringify(data);
    localStorage.eTag = xhr.getResponseHeader('ETag');
    Article.loadAll(data);
    articleView.renderIndexPage();
  });
};
