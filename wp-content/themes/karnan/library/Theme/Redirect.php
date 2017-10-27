<?php

namespace karnan\Theme;

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

        if (!is_front_page()) {
            return false;
        }

        echo '<a name="start"></a>';
    }
}
