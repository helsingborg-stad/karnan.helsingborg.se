<?php

namespace karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    public function init()
    {
        $this->data['sections'] = array(
            array(
                'section_anchor' => sanitize_title("Nibh Tellus Sit Pellentesque Aenean"),
                'post_title' => apply_filters('the_title', "Nibh Tellus Sit Pellentesque Aenean"),
                'post_content' => apply_filters('the_content', "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."),
                'height_indicator' => 100
            ),
            array(
                'section_anchor' => sanitize_title("Nibh Tellus Sit Pellentesque Aenean"),
                'post_title' => apply_filters('the_title', "Nibh Tellus Sit Pellentesque Aenean"),
                'post_content' => apply_filters('the_content', "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."),
                'height_indicator' => 50
            ),
        );
    }
}
