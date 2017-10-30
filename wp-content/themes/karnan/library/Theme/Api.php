<?php
namespace Karnan\Theme;

class Api
{

    private $post;
    private $sidebarId = "content-area";

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'registerRestRoute'));
        add_action('wp_head', array($this, 'printRestUrl'));
    }

    public function registerRestRoute()
    {
        register_rest_route('wp/v2', '/all/', array(
            'methods' => 'GET',
            'callback' => function ($request) {

                if (!isset($request['slug'])) {
                    return null;
                }

                $request['slug'] = str_replace(get_blog_details()->path, "/", $request['slug']);

                $return = url_to_postid(
                    home_url() . "/" . $request['slug']
                );

                if (!$return) {
                    return array(
                        'error' => '404',
                        'url' => home_url() . "/" . $request['slug']
                    );
                }

                $this->post = get_post($return);

                return array(
                    'title' => $this->post->post_title,
                    'content' => apply_filters('the_content', $this->post->post_content),
                    'sidebar' => $this->getSidebarContents($this->sidebarId, $this->post->ID)
                );

            }
        ));
    }

    public function getSidebarContents($sidebarId, $postId)
    {
        $modules = get_post_meta($postId, 'modularity-modules', true);

        if (!empty($modules) && is_array($modules) && isset($modules[$sidebarId]) && !empty($modules[$sidebarId])) {
            $return = "";
            foreach ((array) $modules[$sidebarId] as $moduleItem) {
                if ($moduleItem['hidden'] !== false) {
                    $return = $return . do_shortcode('[modularity id="' . $moduleItem['postid'] . '"]');
                }
            }

            return $return;
        }

        return "";
    }

    public function printRestUrl()
    {
        echo '<script>var rest_url = "' . get_rest_url() . '";</script>';
    }
}
