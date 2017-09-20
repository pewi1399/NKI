"use strict";
define(["jquery"], function (jq) {
    function PmSidebar() {
        //  console.log("PmSidebar");
        jq(document).ready(function () {
            var sidebarPageWrapper = jq('#pm-sidebar-page-wrapper'),
                sidebarToggle = jq('#pm-sidebar-toggle-button'),
                sidebarOverlay = jq('#pm-sidebar-overlay');

            sidebarToggle.click(function () {
                var isOpen = sidebarPageWrapper.hasClass('is-open');
                if(isOpen){
                    sidebarPageWrapper.removeClass('is-open');
                    sidebarPageWrapper.addClass('is-closed');
                }
                else{
                    sidebarPageWrapper.removeClass('is-closed');
                    sidebarPageWrapper.addClass('is-open');
                }
            });

            sidebarOverlay.click(function () {
                //console.log("sidebarOverlay.click(");
                var isOpen = sidebarPageWrapper.hasClass('is-open');
                if(isOpen){
                    sidebarPageWrapper.removeClass('is-open');
                    sidebarPageWrapper.addClass('is-closed');
                }
                else{
                    sidebarPageWrapper.removeClass('is-closed');
                    sidebarPageWrapper.addClass('is-open');
                }                
            });
        });
    }
    return PmSidebar;
});