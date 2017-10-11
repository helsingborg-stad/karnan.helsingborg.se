<?php

namespace karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    public function init()
    {

        $this->data['video'] = array(
            'webm' => 'https://karnan.dev/wp-content/themes/karnan/assets/video/test.webm',
            /*'mp4' => 'https://hbgvaxer.se/wp-content/uploads/sites/8/2017/01/hbg-vaxer170314.mp4',
            'ogv' => 'https://hbgvaxer.se/wp-content/uploads/sites/8/2017/01/hbg-vaxer170314.ogv',*/
        );

        $this->data['sections'] = array(
            array(
                'section_name' => "Takterassen",
                'section_anchor' => sanitize_title("Nibh Tellus Sit Pellentesque Aenean"),
                'post_title' => apply_filters('the_title', "Nibh Tellus Sit Pellentesque Aenean"),
                'post_content' => apply_filters('the_content', "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."),
                'height_indicator' => 100
            ),
            array(
                'section_name' => "Fjärde våningen",
                'section_anchor' => sanitize_title("Nibh Tellus Sit Pellentesque Aenean"),
                'post_title' => apply_filters('the_title', "Nibh Tellus Sit Pellentesque Aenean"),
                'post_content' => apply_filters('the_content', "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."),
                'height_indicator' => 50
            ),
        );
    }
}
