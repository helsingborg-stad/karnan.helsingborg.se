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

        $this->data['sections'] = get_field('karnan_sections', 'option');
    }
}
