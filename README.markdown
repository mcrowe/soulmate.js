# soulmate.js

Soulmate.js is a jQuery plugin front-end for [soulmate](https://github.com/seatgeek/soulmate), an excellent auto-suggestion gem built for speed on sinatra and redis. Together, they provide lightning-fast plug-n-play auto-suggestion. See [soulmate on github](https://github.com/seatgeek/soulmate) for more details on the back-end interface.

_**Note:** This plugin is not affiliated with the soulmate gem or its authors. The name is merely a knock-off._

## Demo

Soulmate.js is inspired by the excellent autocompletion interface used on [seatgeek.com](http://seatgeek.com). It works and feels very similar, although the implementation is entirely original.

The `demo` directory in the source provides an example usage and styling of the plugin. It does not supply a back-end, however, so you will have to set up [soulmate](https://github.com/seatgeek/soulmate) and point the demo to it.

## Features

* **Well tested:** Ridiculous spec coverage using Jasmine.
* **Clean markup:** Renders a clean and semantic markup structure that is easy to style.
* **Speed:** Minimizes requests by maintaining a list of queries with no suggestions. No additional requests are made when a user keeps typing on an empty query.
* **Cross-domain compatible:** Uses jsonp to accommodate backends on separate domain (which is a good practice since it allows the auto-suggest system to get overwhelmed without affecting the main site).
* **Customizable behaviour:** Customized rendering of suggestions through a callback that provides all stored data for that suggestion. Customized suggestion selection behaviour through a callback.
* **Adaptable:** A modular, object-oriented design, that is meant to be very easy to adapt and modify.

## Usage

First, setup an instance of [soulmate](https://github.com/seatgeek/soulmate). Then, grab `src/compiled/jquery.soulmate.js` and place it in your project. Finally, do something like the following (or follow the example in the `demo` directory):

`index.html`

    ...
    <script type="text/javascript" src="jquery.soulmate.js">
    <script type="text/javascript" src="main.js">
    ...
    <input id="search-input" type="text" name="q" value="" autocomplete="off"/>

`main.js`

    ...
    // Define the rendering and selecting behaviour for suggestions.
    render = function(term, data, type){ return term; }
    select = function(term, data, type){ console.log("Selected " + term); }

    // Make the input field autosuggest-y.
    $('#search-input').soulmate({
      url:            'http://soulmate.YOUR-DOMAIN.com',
      types:          ['type1', 'type2', 'type3', 'type4'],
      renderCallback: render,
      selectCallback: select,
      minQueryLength: 2,
      maxResults:     5
    });
    ...

For more information, see the specifications in the `spec/` directory.

## Running Specs

Soulmate.js is covered by Jasmine and Jasmine-JQuery specs. See the `spec/` directory to browse the specifications.

To run the specs, simply open `spec/spec_runner.html` in your browser.