<header id="site-header" class="site-header fixed-bottom {{ $headerLayout['classes'] }}">
    <div class="print-only container">
        <div class="grid">
            <div class="grid-sm-12">
                {!! municipio_get_logotype('standard') !!}
            </div>
        </div>
    </div>

@include('partials.search.top-search')

<nav class="navbar navbar-mainmenu hidden-print {{ is_front_page() && get_field('header_transparent', 'option') ? 'navbar-transparent' : '' }} {{ get_field('header_sticky', 'option') ? 'sticky-scroll' : '' }}">
    <div class="container">
        <div class="grid">
            <div class="grid-xs-12 {!! apply_filters('Municipio/header_grid_size', 'grid-md-12'); !!}">
                <div class="grid">
                    <div class="{{ get_field('header_centered', 'option') ? 'grid-md-12' : 'grid-sm-12 grid-md-2' }}">
                        {!! municipio_get_logotype(get_field('header_logotype', 'option'), get_field('logotype_tooltip', 'option')) !!}
                        @if (strlen($navigation['mobileMenu']) > 0)
                        <a href="#mobile-menu" data-target="#mobile-menu" class="{!! apply_filters('Municipio/mobile_menu_breakpoint', 'hidden-md hidden-lg'); !!} menu-trigger"><span class="menu-icon"></span></a>
                        <a href="#translate" class="{!! apply_filters('Municipio/mobile_menu_breakpoint', 'hidden-md hidden-lg'); !!} menu-translate" aria-label="translate"><i class="pricon pricon-globe pricon-lg"></i></a>
                        @endif
                    </div>

                    @if (get_field('nav_primary_enable', 'option') === true)
                    <div class="{{ get_field('header_centered', 'option') ? 'grid-md-12' : 'grid-md-10 text-right' }} {!! apply_filters('Municipio/desktop_menu_breakpoint', 'hidden-xs hidden-sm'); !!}">
                        <nav class="nav-group-overflow" data-btn-width="100">
                            {!! $navigation['mainMenu'] !!}

                            <span class="dropdown">
                                <span class="btn btn-primary dropdown-toggle hidden"><?php _e('More', 'municipio'); ?></span>
                                <ul class="dropdown-menu nav-grouped-overflow hidden"></ul>
                            </span>
                        </nav>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</nav>

@if (strlen($navigation['mobileMenu']) > 0)
    <nav id="mobile-menu" class="nav-mobile-menu nav-toggle-expand nav-toggle {!! apply_filters('Municipio/mobile_menu_breakpoint', 'hidden-md hidden-lg'); !!} hidden-print">
        @include('partials.mobile-menu')
    </nav>
@endif

</header>

@include('partials.hero')

@if (is_active_sidebar('top-sidebar'))
    <?php dynamic_sidebar('top-sidebar'); ?>
@endif
