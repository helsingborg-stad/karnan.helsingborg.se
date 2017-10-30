<?php

namespace Karnan\Theme;

class Redirect
{
    public function __construct()
    {
        add_action('wp_head', array($this, 'redirectToBottomSection'));
        add_action('wp_footer', array($this, 'addAnchorLink'));
    }

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

    public function addAnchorLink()
    {
        echo '<a name="start"></a>';
    }
}
