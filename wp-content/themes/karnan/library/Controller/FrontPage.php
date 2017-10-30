<?php

namespace karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    private $db = null;

    public function init()
    {

        //Define global as local value
        $this->globalToLocal("wpdb", "db");

        //Get entered details
        $this->data['sections'] = is_array(get_field('karnan_sections', 'option')) ? get_field('karnan_sections', 'option') : array();

        //Get background images url
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['background'] = get_stylesheet_directory_uri() . '/assets/image/sections/' . ($key+1) . '.png';
            }
        }

        //Create alternative span-wrapped title
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['section_title_span'] = '<span class="first-word">' . preg_replace('/ /', '</span> ', $section['section_title'] . " ", 1);
            }
        }

        //Virtual guide link
        if ($guideLink = $this->getVirtualGuideLink()) {
            $this->data['virtualGuidePage'] = $guideLink;
        } else {
            $this->data['virtualGuidePage'] = null;
        }
    }

    public function getVirtualGuideLink()
    {
        $page_id =  $this->db->get_var(
                        "SELECT post_id FROM ". $this->db->postmeta  ." WHERE meta_key = '_wp_page_template' AND meta_value = 'virtual-section.blade.php' LIMIT 1"
                    );

        if (is_numeric($page_id) && $permalink = get_permalink($page_id)) {
            return $permalink;
        }

        return false;
    }

    public function globalToLocal($global, $local = null)
    {
        global $$global;

        if (is_null($local)) {
            $this->$global = $$global;
        } else {
            $this->$local = $$global;
        }
    }
}
