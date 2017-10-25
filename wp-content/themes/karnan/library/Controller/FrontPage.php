<?php

namespace karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    public function init()
    {

        //Get entered details
        $this->data['sections'] = is_array(get_field('karnan_sections', 'option')) ? get_field('karnan_sections', 'option') : array();

        //Get background images url
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['background'] = get_stylesheet_directory_uri() . '/assets/image/sections/' . ($key+1) . '.png';
            }
        }

    }
}
