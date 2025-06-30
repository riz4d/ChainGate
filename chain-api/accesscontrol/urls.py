from django.urls import path
from accesscontrol.controller.controller import pn532data
from accesscontrol.controller.usersdir.userdata import UserListView
from accesscontrol.controller.accesslogs.accesscontroller import AccessLogsView
from accesscontrol.controller.security.acceslevels import AccessLevelsView
from accesscontrol.controller.security.alertconfig import AlertConfigView
from accesscontrol.controller.devicemanagement.device import DeviceManagementView
from accesscontrol.controller.blockchain.chaininfo import ChainInfoView, BlockchainTransactionsView
from accesscontrol.controller.settings.setting import SettingsView
from accesscontrol.controller.main.overiew import OverviewView
from accesscontrol.controller.search.users import UserSearchView,UserSummarizeView
urlpatterns = [
    path('access/', pn532data.as_view(), name='nfc_data'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<str:user_id>/', UserListView.as_view(), name='user_detail'),
    path('logs/', AccessLogsView.as_view(), name='access_logs'),
    path('access-levels/', AccessLevelsView.as_view(), name='access_levels_list'),
    path('access-levels/<str:level_id>/', AccessLevelsView.as_view(), name='access_level_detail'),
    path('alert-config/', AlertConfigView.as_view(), name='alert_config'),
    path('alert-config/<str:config_id>/', AlertConfigView.as_view(), name='alert_config_detail'),
    path('devices/', DeviceManagementView.as_view(), name='devices'),
    path('devices/<str:device_id>/', DeviceManagementView.as_view(), name='device_detail'),
    path('blockchain/chain-info/', ChainInfoView.as_view(), name='chain_info'),
    path('blockchain/transactions/', BlockchainTransactionsView.as_view(), name='blockchain_transactions'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('settings/<str:setting_id>/', SettingsView.as_view(), name='setting_detail'),
    path('overview/', OverviewView.as_view(), name='overview'),
    path('search/', UserSearchView.as_view(), name='user_search'),
    path('search/<str:user_id>/', UserSearchView.as_view(), name='user_search_by_id'),
    path('summarize/', UserSummarizeView.as_view(), name='user_summarize_all'),
    path('summarize/<str:user_id>/', UserSummarizeView.as_view(), name='user_summarize'),
    
]
