<?php

namespace Karnan\Controller;

class FrontPage extends \Municipio\Controller\BaseController
{
    private $db = null;

    public function init()
    {

        //Define global as local value
        $this->globalToLocal("wpdb", "db");

        //Get youtube live feed
        $this->data['live'] = !empty(get_field('youtube_live_video_url', 'option')) ? $this->getYoutubeId(get_field('youtube_live_video_url', 'option')) : null;

        //Get entered details
        $this->data['sections'] = is_array(get_field('karnan_sections', 'option')) ? get_field('karnan_sections', 'option') : array();

        //Get album art miniature
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                if (is_numeric($section['section_audioguide_albumbart'])) {
                    $section['section_audioguide_albumbart'] = municipio_get_thumbnail_source($section['section_audioguide_albumbart'], array(50,50));
                }
            }
        }

        //Create alternative span-wrapped title
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['section_title_span'] = '<span class="bolder">' . preg_replace('/ /', '</span> ', $section['section_title'] . " ", 1);
            }
        }

        //Virtual guide link
        if ($guideLink = $this->getVirtualGuideLink()) {
            $this->data['virtualGuidePage'] = $guideLink;
        } else {
            $this->data['virtualGuidePage'] = null;
        }
    }

    /**
     * Gets the permalink of the page with virtual-section template (first page in structure)
     * @return mixed [bool, string]
     */

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

    /**
     * Parses a youtube url to get the id from it
     * @param string $youtubeurl A url to a youtube video
     * @return mixed [bool, string]
     */

    public function getYoutubeId($youtubeurl)
    {
        if (preg_match("/^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^\?&\"'>]+)/", $youtubeurl, $match)) {
            return isset($match[1]) ? $match[1] : false;
        }

        return false;
    }

    /**
     * Creates a local copy of the global instance
     * @param string $global The name of global varable that should be made local
     * @param string $local Handle the global with the name of this string locally
     * @return void
     */

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
