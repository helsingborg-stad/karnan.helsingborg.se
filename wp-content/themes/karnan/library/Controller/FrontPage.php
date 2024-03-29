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

        //Get youtube live feed url & id
        $this->data['live_placeholder'] = !empty(get_field('youtube_live_video_placeholder', 'option')) ? get_field('youtube_live_video_placeholder', 'option') : null;

        if (is_array($image = wp_get_attachment_image_src($this->data['live_placeholder'], array(1250, 704)))) {
            $this->data['live_placeholder_url'] = $image[0];
        } else {
            $this->data['live_placeholder_url'] = null;
        }

        //Get entered details
        $this->data['sections'] = is_array(get_field('karnan_sections', 'option')) ? get_field('karnan_sections', 'option') : array();

        //Switch live video
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                if (in_array($key, array(0))) {
                    $section['show_live_icon'] = true;
                } else {
                    $section['show_live_icon'] = false;
                }
            }
        }

        //Get album art miniature
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                if (is_numeric($section['section_audioguide_albumbart'])) {
                    if (is_array($image = wp_get_attachment_image_src($section['section_audioguide_albumbart'], array(50, 50)))) {
                        $section['section_audioguide_albumbart'] = $image[0];
                    }
                }
            }
        }

        //Create alternative span-wrapped title
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['section_title_span'] = '<span class="bolder">' . preg_replace('/ /', '</span> ', $section['section_title'] . " ", 1);
            }
        }

        //Create truncated versions of the content
        if (is_array($this->data['sections']) && !empty($this->data['sections'])) {
            foreach ($this->data['sections'] as $key => &$section) {
                $section['content_truncated'] = wp_trim_words($section['content'], 80, "…");

                if ($section['content_truncated'] !== wp_trim_words($section['content'], 3000, "…")) {
                    $section['show_read_more'] = true;
                } else {
                    $section['show_read_more'] = false;
                }

                $section['content_truncated'] = apply_filters('the_content', $section['content_truncated']);
            }
        }
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
