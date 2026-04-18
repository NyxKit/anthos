import { computed, reactive, toValue, watch, type MaybeRefOrGetter } from 'vue'
import anthos from '@anthos/shared/anthos'
import { POWER_PROFILES } from '@anthos/shared/nodes/data/powerProfiles'
import type { NodePowerProfileState } from '@anthos/shared/nodes/types/powerProfile'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'

const profileStateCache = reactive(new Map<string, NodePowerProfileState | null>())
const profileLoadingCache = reactive(new Map<string, boolean>())
const profileErrorCache = reactive(new Map<string, string | null>())

export function useNodePowerProfile(nodeIdSource: MaybeRefOrGetter<string | undefined>) {
  const nodeId = computed(() => toValue(nodeIdSource) ?? '')

  const profileState = computed(() => {
    return nodeId.value ? profileStateCache.get(nodeId.value) ?? null : null
  })

  const profileStateLoading = computed(() => {
    return nodeId.value ? profileLoadingCache.get(nodeId.value) ?? false : false
  })

  const profileError = computed(() => {
    return nodeId.value ? profileErrorCache.get(nodeId.value) ?? null : null
  })

  const selectedProfileId = computed(() => {
    return profileState.value?.assignment?.profileId
      ?? profileState.value?.applied?.profileId
      ?? PowerProfile.Balanced
  })

  const selectedProfileLabel = computed(() => {
    return POWER_PROFILES[selectedProfileId.value]?.label ?? selectedProfileId.value
  })

  const selectedProfileOption = computed(() => {
    const profile = POWER_PROFILES[selectedProfileId.value]
    return profile ? { label: profile.label, value: profile.id, icon: profile.icon } : null
  })

  watch(nodeId, () => {
    void loadPowerProfile()
  }, { immediate: true })

  async function loadPowerProfile() {
    if (!nodeId.value) return

    profileLoadingCache.set(nodeId.value, true)
    profileErrorCache.set(nodeId.value, null)

    try {
      const state = await anthos.nodes.getPowerProfile(nodeId.value)
      profileStateCache.set(nodeId.value, state)
    } catch (error) {
      profileStateCache.set(nodeId.value, null)
      profileErrorCache.set(nodeId.value, error instanceof Error ? error.message : 'Failed to load power profile')
    } finally {
      profileLoadingCache.set(nodeId.value, false)
    }
  }

  async function applyPowerProfile(profileId: PowerProfile) {
    if (!nodeId.value) return

    profileLoadingCache.set(nodeId.value, true)
    profileErrorCache.set(nodeId.value, null)

    try {
      const state = await anthos.nodes.applyPowerProfile(nodeId.value, profileId)
      profileStateCache.set(nodeId.value, state)
    } catch (error) {
      profileErrorCache.set(nodeId.value, error instanceof Error ? error.message : 'Failed to apply power profile')
    } finally {
      profileLoadingCache.set(nodeId.value, false)
    }
  }

  return {
    nodeId,
    profileState,
    profileStateLoading,
    profileError,
    selectedProfileId,
    selectedProfileLabel,
    selectedProfileOption,
    loadPowerProfile,
    applyPowerProfile,
  }
}
