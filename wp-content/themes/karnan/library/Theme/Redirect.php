<?php

namespace Karnan\Theme;

class Redirect
{
    public function __construct()
    {
        add_action('wp_head', array($this, 'redirectToBottomSection'));
        add_action('wp_footer', array($this, 'addAnchorLink'));
    }

    /**
     * Echo function that adds #start hash if not defined (start at bottom)
     * @return void
     */

    public function redirectToBottomSection()
    {
        echo '
        <script>
            if (window.location.hash == "") {
                window.location.hash = "start";
            }
        </script>
        ';
    }

    /**
     * Echos the anchor that above function uses as a default (in footer)
     * @return void
     */

    public function addAnchorLink()
    {
        echo '<a name="start"></a>';
    }
}
