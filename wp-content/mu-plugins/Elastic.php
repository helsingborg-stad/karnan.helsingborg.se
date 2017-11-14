<?php

namespace Municipio\Search;

class Elasticsearch
{
    public static $postTypeFilter = null;

    public function __construct()
    {
        //Ordering for search
        add_action('pre_get_posts', array($this, 'setTypes'), 1000);
        add_action('pre_get_posts', array($this, 'setOrderby'), 1000);

        //Elastic integrations
        add_filter('ep_indexable_post_status', array($this, 'indexablePostStatuses'));
        add_filter('ep_indexable_post_types', array($this, 'indexablePostTypes'));
        add_filter('ep_search_args', array($this, 'searchArgs'), 10, 3);

        //Exclude from search
        add_action('post_submitbox_misc_actions', array($this, 'excludeFromSearchCheckbox'), 100);
        add_action('attachment_submitbox_misc_actions', array($this, 'excludeFromSearchCheckbox'), 100);

        add_action('save_post', array($this, 'saveExcludeFromSearch'));
        add_action('edit_attachment', array($this, 'saveExcludeFromSearch'));

        //Stemmer language
        add_filter('ep_analyzer_language', function () {
            return 'Swedish';
        });
    }

    /**
     * Adds form field for exclude from search
     * @return void
     */
    public function excludeFromSearchCheckbox()
    {
        global $post;
        $checked = checked(true, get_post_meta($post->ID, 'exclude_from_search', true), false);

        echo '<div class="misc-pub-section">
            <label><input type="checkbox" name="elasicpress-exclude-from-search" value="true" ' . $checked . '> ' . __('Exclude from search', 'municipio') . '</label>
        </div>';
    }

    /**
     * Saves the "exclude from search" value
     * @param  int $postId The post id
     * @return void
     */
    public function saveExcludeFromSearch($postId)
    {
        if (!isset($_POST['elasicpress-exclude-from-search']) || $_POST['elasicpress-exclude-from-search'] != 'true') {
            delete_post_meta($postId, 'exclude_from_search');
            return;
        }

        update_post_meta($postId, 'exclude_from_search', true);
    }

    /**
     * Indexable post statuses
     * @param  array $statuses Default post statuses
     * @return array           Updated post statuses
     */
    public function indexablePostStatuses($statuses)
    {
        $statuses[] = 'publish';
        $statuses[] = 'inherit';

        return array_unique($statuses);
    }

    /**
     * Indexable post types
     * @param  array $types Default post types
     * @return array Updated post types
     */
    public function indexablePostTypes($types)
    {
        return array_unique(array_merge($types, self::getPublic()));
    }

    /**
     * The search args for the search query
     * @param  array $args         Search arguments
     * @return array               Modified arguments
     */
    public function searchArgs($args, $scope, $query_args)
    {

        $q = trim($query_args['s']);

        $args['min_score'] = 0.03;

        //Advanced query
        $args['query'] = array(
            'bool' => array(
                // Match keywords
                'must' => array(
                    array(
                        'multi_match' => array(
                            'query' => $q,
                            'fuzziness' => $this->fuzzynessSize($q),
                            'fields' => array(
                                'post_title^7',
                                'post_content^3',
                                'terms.post_tag.name^4'
                            )
                        )
                    )
                ),

                // Match full query
                'should' => array(
                    array(
                        'multi_match' => array(
                            'query' => $q,
                            'fields' => array(
                                'post_title^7',
                                'post_content^3'
                            ),
                            'type' => 'phrase'
                        )
                    ),
                )
            )
        );

        // Use simple_query_string query
        if (isset($_GET['type']) && $_GET['type'] === 'simple') {
            $args['query'] = array(
                'simple_query_string' => array(
                    'fields' => array('post_title^7', 'post_content^3', 'terms.post_tag.name^4'),
                    'query' => $q . '~'.$this->fuzzynessSize($q),
                    'analyzer' => 'elasticpress_synonyms'
                )
            );
        }

        // Get allowed image mimes to be able to filter them out from serach result
        $imageMimes = array_values(array_filter(get_allowed_mime_types(), function ($mime) {
            return substr($mime, 0, 6) === 'image/';
        }));

        // Add image mime filter
        $args['post_filter']['bool']['must_not'] = array(
            array(
                'terms' => array(
                    'post_mime_type' => apply_filters('Municipio/search/mimefilter', $imageMimes),
                ),
            ),
            array(
                'term' => array(
                    'meta.exclude_from_search.boolean' => true
                )
            )
        );

        $args = apply_filters('Municipio/search/args', $args, $query_args['s']);

        return $args;
    }

    /**
     * Fuzziness size depending on query length
     * @param  string $query The search query
     * @return string        Fuzziness
     */
    public function fuzzynessSize($query = '')
    {
        $max_fuzzyness = 2;
        $min_fuzzyness = 0;
        $division_by = 3;

        if (strlen($query) >= $division_by) {
            return (string) '0';
        }

        if ($string_lengt = floor(strlen($query)/$division_by)) {
            if ($string_lengt >= $max_fuzzyness) {
                return (string) $max_fuzzyness;
            }

            if ($string_lengt <= $min_fuzzyness) {
                return (string) $min_fuzzyness;
            }

            return (string) $string_lengt;
        }

        return '0';
    }

    /**
     * Set which post types and statuses to search for
     * @param WP_Query $query
     */
    public function setTypes($query)
    {
        // If not search or main query, return the default query
        if (!is_search() || is_post_type_archive() || !$query->is_main_query() || is_admin()) {
            return;
        }

        $postTypes = self::getPublic(self::$postTypeFilter);

        $query->set('cache_results', false);
        $query->set('post_type', $postTypes);

        $postStatuses  = array('publish', 'inherit');

        $query->set('post_status', $postStatuses);
    }

    /**
     * Set orderby to relevance
     * @param WP_Query $query
     */
    public function setOrderby($query)
    {
        // If not search or main query, return the default query
        if (!is_search() || is_post_type_archive() || !$query->is_main_query() || is_admin()) {
            return;
        }

        // Set orderby
        $query->set('orderby', 'relevance');
    }

    /**
     * Get all public post types
     * @param WP_Query $query
     */
    public static function getPublic($filter = null, $useSiteOption = true)
    {
        $postTypes = array();
        if ($useSiteOption && is_multisite()) {
            $postTypes = get_site_option('public_post_types', array());
        } else {
            $args = array(
                'public' => true,
                'exclude_from_search' => false
            );
            $postTypes = get_post_types($args);
        }

        // Filters out given post types
        $filter = array_merge(
            (array) $filter,
            array('nav_menu_item', 'revision')
        );

        return array_values(array_diff($postTypes, $filter));
    }
}

new Elasticsearch();
