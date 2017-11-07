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
        if (!is_front_page() && !is_post_type_archive('virtual-section')) {
            return;
        }

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

        if (!is_front_page() && !is_post_type_archive('virtual-section')) {
            return;
        }

        echo '<a name="start"></a>';
    }
}
