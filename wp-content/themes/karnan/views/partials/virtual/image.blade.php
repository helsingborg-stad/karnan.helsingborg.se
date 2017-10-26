<div class="grid-lg-4 grid-md-12">
    @if(!empty($section['section_image']['url']))
        <img src="{{ $section['section_image']['url'] }}" class="image virtual-section-image" alt="{{ $section['section_title'] }}">
    @endif
</div>
