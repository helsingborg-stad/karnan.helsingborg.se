<?php

namespace karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    public function init()
    {

        $this->data['video'] = array(
            'mp4' => 'https://karnan.dev/wp-content/themes/karnan/assets/video/karnan.mp4',
            //'webm' => 'https://karnan.dev/wp-content/themes/karnan/assets/video/test.webm',
            //'webm' => 'https://hbgvaxer.se/wp-content/uploads/sites/8/2017/01/hbg-vaxer170314.webm',
            //'mp4' => 'https://hbgvaxer.se/wp-content/uploads/sites/8/2017/01/hbg-vaxer170314.mp4',
            //'ogv' => 'https://hbgvaxer.se/wp-content/uploads/sites/8/2017/01/hbg-vaxer170314.ogv',
        );

        $this->data['sections'] = is_array(get_field('karnan_sections', 'option')) ? get_field('karnan_sections', 'option') : array();

        //Get background images url
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['background'] = get_stylesheet_directory_uri() . '/assets/image/background/' . ($key+1) . '.png';
            }
        }

        $this->data['sections'] = array_reverse($this->data['sections']);
    }
}
