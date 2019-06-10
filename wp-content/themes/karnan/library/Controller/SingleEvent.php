<?php

namespace Karnan\Controller;

class SingleEvent extends \Municipio\Controller\SingleEvent
{
    public function init()
    {
        global $post;
        $this->data['date'] =  method_exists('\EventManagerIntegration\Helper\SingleEventData', 'singleEventDate') ? \EventManagerIntegration\Helper\SingleEventData::singleEventDate() : null;
        $this->data['location'] = get_post_meta($post->ID, 'location', true);
    }

    /**
     * Get attached images from Post, except featured image
     * @param  int $id Post ID
     * @return array
     */
    public static function getAttachedImages($id)
    {
        $args = array(
            'post_parent'    => $id,
            'post_type'      => 'attachment',
            'numberposts'    => -1,
            'post_status'    => 'any',
            'post_mime_type' => 'image',
            'orderby'        => 'menu_order',
            'order'          => 'ASC',
            'exclude'        => get_post_thumbnail_id($id)
        );
        $images = get_posts($args);

        if (!empty($images)) {
            foreach ($images as &$image) {
                $image = wp_get_attachment_image_src($image->ID, 'full');
            }
        }

        return $images;
    }
}
